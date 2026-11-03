import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { AgeId, Channel, FinishResult, Video } from '../types';
import { AGE_ORDER, CATALOG, allChannelIds, ageIndex } from '../data/catalog';
import { KEYS, store } from '../lib/store';
import { YT_KEY, fetchChannelVideos, thumbUrl, type FetchedVideo } from '../lib/youtube';
import {
  JourneyContext, STARS_PER_LEVEL, STARS_PER_VIDEO, STREAK_BONUS,
  type HistoryEntry, type Journey,
} from './journey-context';

type Pool = FetchedVideo[];
interface Streak { count: number; lastDay: string }

const dayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const yesterdayKey = () => { const d = new Date(); d.setDate(d.getDate() - 1); return dayKey(d); };

const fallbackPool = (ch: Channel): Pool => ch.videos.map(id => ({ id, title: '', thumb: thumbUrl(id) }));

// Stored pools may be legacy string[] from the previous version
function readPool(chId: string): Pool | null {
  const raw = store.get<(string | FetchedVideo)[]>(KEYS.pool(chId));
  if (!raw?.length) return null;
  return raw.map(v => typeof v === 'string' ? { id: v, title: '', thumb: thumbUrl(v) } : v);
}

// channelId -> { channel, category } — first occurrence per age group wins
function channelIndex(age: AgeId) {
  const map = new Map<string, { ch: Channel; category: string }>();
  CATALOG[age].forEach(cat => cat.channels.forEach(ch => {
    if (!map.has(ch.channelId)) map.set(ch.channelId, { ch, category: cat.category });
  }));
  return map;
}

// v2: pools are filtered for livestreams and >1h videos. Older caches are dropped once so they
// re-fetch; watched/stars/history are untouched.
const POOL_VERSION = 2;

function initialPools(): Record<string, Pool> {
  if (store.get<number>(KEYS.poolVersion) !== POOL_VERSION) {
    AGE_ORDER.forEach(age => {
      store.remove(KEYS.bulkDone(age));
      allChannelIds(age).forEach(chId => { store.remove(KEYS.pool(chId)); store.remove(KEYS.nextToken(chId)); });
    });
    store.set(KEYS.poolVersion, POOL_VERSION);
  }
  const pools: Record<string, Pool> = {};
  AGE_ORDER.forEach(age => allChannelIds(age).forEach(chId => {
    const p = readPool(chId);
    if (p) pools[chId] = p;
  }));
  return pools;
}

export function JourneyProvider({ children }: { children: ReactNode }) {
  const [maxAge, setMaxAgeState]   = useState<AgeId | null>(() => store.get<AgeId>(KEYS.maxAge));
  const [viewingAge, setViewing]   = useState<AgeId | null>(() => store.get<AgeId>(KEYS.viewingAge) || store.get<AgeId>(KEYS.maxAge));
  const [pin, setPinState]         = useState<string>(() => store.get<string>(KEYS.pin) || '1234');
  const [pools, setPools]          = useState<Record<string, Pool>>(initialPools);
  const [watched, setWatched]      = useState<Set<string>>(() => new Set(store.get<string[]>(KEYS.watched) || []));
  const [history, setHistory]      = useState<HistoryEntry[]>(() => store.get<HistoryEntry[]>(KEYS.history) || []);
  const [saved, setSaved]          = useState<string[]>(() => store.get<string[]>(KEYS.saved) || []);
  const [stars, setStars]          = useState<number>(() => store.get<number>(KEYS.stars) || 0);
  const [streakRaw, setStreakRaw]  = useState<Streak>(() => store.get<Streak>(KEYS.streak) || { count: 0, lastDay: '' });
  const [mastered, setMastered]    = useState<string[]>(() => store.get<string[]>(KEYS.mastered) || []);
  const [loadingAge, setLoadingAge] = useState<AgeId | null>(null);
  const [loadedChannels, setLoadedChannels] = useState<Set<string>>(new Set());
  const [refilling, setRefilling]  = useState<Set<string>>(new Set());
  const refillLock = useRef(new Set<string>());

  // ---------------------------------------------------------------- content
  const poolFor = useCallback((ch: Channel): Pool => pools[ch.channelId] ?? fallbackPool(ch), [pools]);

  // Lookup of every known video across all ages (first channel/category wins)
  const videoIndex = useMemo(() => {
    const map = new Map<string, Video>();
    const ages = viewingAge ? [viewingAge, ...AGE_ORDER.filter(a => a !== viewingAge)] : AGE_ORDER;
    ages.forEach(age => channelIndex(age).forEach(({ ch, category }) => {
      poolFor(ch).forEach(v => {
        if (!map.has(v.id)) map.set(v.id, {
          id: v.id, title: v.title || null, thumb: v.thumb, publishedAt: v.publishedAt,
          channelId: ch.channelId, channelName: ch.name, category,
        });
      });
    }));
    return map;
  }, [poolFor, viewingAge]);

  const getVideo = useCallback((id: string) => videoIndex.get(id), [videoIndex]);

  const channelVideos = useCallback((channelId: string): Video[] => {
    for (const age of AGE_ORDER) {
      const hit = channelIndex(age).get(channelId);
      if (hit) return poolFor(hit.ch).map(v => videoIndex.get(v.id)!).filter(Boolean);
    }
    return [];
  }, [poolFor, videoIndex]);

  const channelProgress = useCallback((channelId: string) => {
    const vids = channelVideos(channelId);
    return { watched: vids.filter(v => watched.has(v.id)).length, total: vids.length };
  }, [channelVideos, watched]);

  const categories = useMemo(() => (viewingAge ? CATALOG[viewingAge] : []), [viewingAge]);

  // Unwatched videos for the viewing age, round-robin across channels so the feed feels varied
  const feed = useMemo(() => {
    if (!viewingAge) return [];
    const lists = [...channelIndex(viewingAge).values()].map(({ ch }) =>
      poolFor(ch).filter(v => !watched.has(v.id)).map(v => videoIndex.get(v.id)!).filter(Boolean));
    const out: Video[] = []; const seen = new Set<string>();
    for (let i = 0; lists.some(l => i < l.length); i++) {
      lists.forEach(l => { const v = l[i]; if (v && !seen.has(v.id)) { seen.add(v.id); out.push(v); } });
    }
    return out;
  }, [viewingAge, poolFor, watched, videoIndex]);

  // ---------------------------------------------------------------- fetching
  const bulkFetch = useCallback(async (age: AgeId) => {
    if (store.get(KEYS.bulkDone(age))) return;
    setLoadingAge(age); setLoadedChannels(new Set());
    await Promise.all(allChannelIds(age).map(async chId => {
      if (!readPool(chId)) {
        const { videos, nextPageToken } = await fetchChannelVideos(chId);
        if (videos.length) {
          store.set(KEYS.pool(chId), videos);
          store.set(KEYS.nextToken(chId), nextPageToken);
          setPools(p => ({ ...p, [chId]: videos }));
        }
      }
      setLoadedChannels(prev => new Set(prev).add(chId));
    }));
    store.set(KEYS.bulkDone(age), true);
    setLoadingAge(null);
  }, []);

  // Make sure the age being viewed has been fetched — covers browsing down to a never-fetched
  // age and the one-time re-fetch after a POOL_VERSION bump
  useEffect(() => {
    if (!viewingAge || store.get(KEYS.bulkDone(viewingAge))) return;
    const t = setTimeout(() => void bulkFetch(viewingAge)); // cancelled on cleanup (StrictMode re-run)
    return () => clearTimeout(t);
  }, [viewingAge, bulkFetch]);

  // Fetch the next batch for a channel once its current batch is fully watched
  const refill = useCallback(async (chId: string, watchedNow: Set<string>) => {
    if (!YT_KEY || refillLock.current.has(chId)) return false;
    refillLock.current.add(chId);
    setRefilling(prev => new Set(prev).add(chId));
    const { videos, nextPageToken } = await fetchChannelVideos(chId, store.get<string>(KEYS.nextToken(chId)) || '');
    const fresh = videos.filter(v => !watchedNow.has(v.id));
    if (fresh.length) {
      store.set(KEYS.pool(chId), fresh);
      store.set(KEYS.nextToken(chId), nextPageToken);
      setPools(p => ({ ...p, [chId]: fresh }));
    }
    refillLock.current.delete(chId);
    setRefilling(prev => { const n = new Set(prev); n.delete(chId); return n; });
    return fresh.length > 0;
  }, []);

  // ---------------------------------------------------------------- age actions
  const applyAges = (max: AgeId, view: AgeId) => {
    store.set(KEYS.maxAge, max); store.set(KEYS.viewingAge, view);
    setMaxAgeState(max); setViewing(view);
  };

  const chooseAge = useCallback(async (id: AgeId) => { await bulkFetch(id); applyAges(id, id); }, [bulkFetch]);
  const unlockAge = useCallback(async (id: AgeId) => { await bulkFetch(id); applyAges(id, id); }, [bulkFetch]);

  const browseAge = useCallback((id: AgeId) => {
    if (maxAge && ageIndex(id) <= ageIndex(maxAge)) { store.set(KEYS.viewingAge, id); setViewing(id); }
  }, [maxAge]);

  const setMaxAge = useCallback((id: AgeId) => {
    const view = viewingAge && ageIndex(viewingAge) <= ageIndex(id) ? viewingAge : id;
    applyAges(id, view);
    void bulkFetch(id);
  }, [viewingAge, bulkFetch]);

  const setPin = useCallback((p: string) => { store.set(KEYS.pin, p); setPinState(p); }, []);

  const resetToOnboarding = useCallback(() => {
    store.remove(KEYS.maxAge); store.remove(KEYS.viewingAge);
    setMaxAgeState(null); setViewing(null);
  }, []);

  // ---------------------------------------------------------------- progress
  const today = dayKey();
  const streak = streakRaw.lastDay === today || streakRaw.lastDay === yesterdayKey() ? streakRaw.count : 0;
  const watchedToday = streakRaw.lastDay === today;

  const finishVideo = useCallback((id: string): FinishResult => {
    const video = videoIndex.get(id);
    const alreadyWatched = watched.has(id);

    const nextWatched = new Set(watched).add(id);
    store.set(KEYS.watched, [...nextWatched]); setWatched(nextWatched);

    const nextHistory = [{ id, at: Date.now() }, ...history.filter(h => h.id !== id)].slice(0, 200);
    store.set(KEYS.history, nextHistory); setHistory(nextHistory);

    const streakExtended = !alreadyWatched && streakRaw.lastDay !== today;
    let nextStreak = streakRaw;
    if (streakExtended) {
      nextStreak = { count: streakRaw.lastDay === yesterdayKey() ? streakRaw.count + 1 : 1, lastDay: today };
      store.set(KEYS.streak, nextStreak); setStreakRaw(nextStreak);
    }

    const starsEarned = alreadyWatched ? 0 : STARS_PER_VIDEO + (streakExtended ? STREAK_BONUS : 0);
    const totalStars = stars + starsEarned;
    const before = Math.floor(stars / STARS_PER_LEVEL) + 1;
    const after  = Math.floor(totalStars / STARS_PER_LEVEL) + 1;
    store.set(KEYS.stars, totalStars); setStars(totalStars);

    let channelMastered: string | null = null;
    if (video && !alreadyWatched) {
      const batch = channelVideos(video.channelId);
      if (batch.length && batch.every(v => nextWatched.has(v.id))) {
        channelMastered = video.channelName;
        if (!mastered.includes(video.channelId)) {
          const m = [...mastered, video.channelId];
          store.set(KEYS.mastered, m); setMastered(m);
        }
        void refill(video.channelId, nextWatched);
      }
    }

    return {
      starsEarned, totalStars,
      streak: nextStreak.lastDay === today ? nextStreak.count : streak,
      streakExtended,
      levelUp: after > before ? after : null,
      channelMastered,
    };
  }, [videoIndex, watched, history, streakRaw, today, stars, channelVideos, mastered, refill, streak]);

  const toggleSaved = useCallback((id: string) => {
    setSaved(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [id, ...prev];
      store.set(KEYS.saved, next);
      return next;
    });
  }, []);

  const value: Journey = {
    maxAge, viewingAge, pin, loadingAge, loadedChannels,
    categories, feed, getVideo, channelVideos, channelProgress, refilling,
    watched, history, saved, stars,
    level: Math.floor(stars / STARS_PER_LEVEL) + 1,
    levelProgress: (stars % STARS_PER_LEVEL) / STARS_PER_LEVEL,
    streak, watchedToday, mastered,
    chooseAge, unlockAge, browseAge, setMaxAge, setPin, finishVideo, toggleSaved, resetToOnboarding,
  };

  return <JourneyContext.Provider value={value}>{children}</JourneyContext.Provider>;
}
