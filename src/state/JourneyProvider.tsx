import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { AgeId, Category, Channel, CustomChannel, FinishResult, Video } from '../types';
import { AGE_ORDER, ageIndex } from '../data/catalog';
import {
  DEFAULT_WHY, allCategoryNames, allCuratedChannelIds, channelIdsOf, channelIndexOf,
  curatedChannel, effectiveCatalog,
} from '../data/effective';
import { KEYS, store } from '../lib/store';
import {
  YT_KEY, fetchChannelVideos, parseChannelInput, resolveChannel, thumbUrl, type FetchedVideo,
} from '../lib/youtube';
import {
  JourneyContext, STARS_PER_LEVEL, STARS_PER_VIDEO, STREAK_BONUS,
  type AddChannelInput, type AddResult, type ChannelFailure, type HistoryEntry, type Journey,
  type LookupResult,
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

// v2: pools are filtered for livestreams and >1h videos.
// v3: re-curated catalogue (docs/channel-curation.md) — several old channel IDs were wrong.
// v4: square ≤3-min videos are Shorts too; v3 caches let some through.
// Older caches are dropped once so they re-fetch; watched/stars/history are untouched.
const POOL_VERSION = 4;

// Every cached pool/page token, including channels no longer in the catalogue
function storedPoolKeys(): string[] {
  try {
    return Object.keys(localStorage).filter(k => k.startsWith('kj_pool_') || k.startsWith('kj_nextToken_'));
  } catch { return []; }
}

const readCustom = () => store.get<CustomChannel[]>(KEYS.customChannels) || [];
const readHidden = () => store.get<string[]>(KEYS.hiddenChannels) || [];

// Every channel that may have a stored pool: all curated (hidden ones too, so watch
// history still renders) plus the grown-up's own
const knownChannelIds = () => [...new Set([...allCuratedChannelIds(), ...readCustom().map(c => c.channelId)])];

function initialPools(): Record<string, Pool> {
  const ids = knownChannelIds();
  if (store.get<number>(KEYS.poolVersion) !== POOL_VERSION) {
    AGE_ORDER.forEach(age => store.remove(KEYS.bulkDone(age)));
    storedPoolKeys().forEach(k => store.remove(k));
    store.set(KEYS.poolVersion, POOL_VERSION);
  }
  const pools: Record<string, Pool> = {};
  ids.forEach(chId => {
    const p = readPool(chId);
    if (p) pools[chId] = p;
  });
  return pools;
}

const fail = (error: string, restorable?: string): ChannelFailure => ({ ok: false, error, restorable });

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
  const [customChannels, setCustom] = useState<CustomChannel[]>(readCustom);
  const [hiddenChannels, setHidden] = useState<string[]>(readHidden);

  // ---------------------------------------------------------------- content
  // Effective catalogue per age: curated minus hidden, plus the grown-up's channels
  const catalogs = useMemo(() => {
    const m = {} as Record<AgeId, Category[]>;
    AGE_ORDER.forEach(age => { m[age] = effectiveCatalog(age, customChannels, hiddenChannels); });
    return m;
  }, [customChannels, hiddenChannels]);
  const indexes = useMemo(() => {
    const m = {} as Record<AgeId, ReturnType<typeof channelIndexOf>>;
    AGE_ORDER.forEach(age => { m[age] = channelIndexOf(catalogs[age]); });
    return m;
  }, [catalogs]);

  const ageCategories = useCallback((age: AgeId) => catalogs[age], [catalogs]);

  // Effective entry for a channel in any age (viewing age first); hidden curated channels
  // come last so history, saved and old links still resolve
  const findChannel = useCallback((channelId: string): { ch: Channel; category: string } | undefined => {
    const ages = viewingAge ? [viewingAge, ...AGE_ORDER.filter(a => a !== viewingAge)] : AGE_ORDER;
    for (const age of ages) {
      const hit = indexes[age].get(channelId);
      if (hit) return hit;
    }
    return curatedChannel(channelId);
  }, [indexes, viewingAge]);

  const channelInfo = useCallback((channelId: string) => {
    const hit = findChannel(channelId);
    return hit && { name: hit.ch.name, why: hit.ch.why, category: hit.category };
  }, [findChannel]);

  const poolFor = useCallback((ch: Channel): Pool => pools[ch.channelId] ?? fallbackPool(ch), [pools]);

  // Lookup of every known video across all ages (first channel/category wins). Hidden curated
  // channels are indexed last so watch history can still show their videos.
  const videoIndex = useMemo(() => {
    const map = new Map<string, Video>();
    const ages = viewingAge ? [viewingAge, ...AGE_ORDER.filter(a => a !== viewingAge)] : AGE_ORDER;
    const add = ({ ch, category }: { ch: Channel; category: string }) => poolFor(ch).forEach(v => {
      if (!map.has(v.id)) map.set(v.id, {
        id: v.id, title: v.title || null, thumb: v.thumb, publishedAt: v.publishedAt,
        channelId: ch.channelId, channelName: ch.name, category,
      });
    });
    ages.forEach(age => indexes[age].forEach(add));
    hiddenChannels.forEach(id => { const hit = curatedChannel(id); if (hit) add(hit); });
    return map;
  }, [poolFor, viewingAge, indexes, hiddenChannels]);

  const getVideo = useCallback((id: string) => videoIndex.get(id), [videoIndex]);

  const channelVideos = useCallback((channelId: string): Video[] => {
    const hit = findChannel(channelId);
    return hit ? poolFor(hit.ch).map(v => videoIndex.get(v.id)!).filter(Boolean) : [];
  }, [findChannel, poolFor, videoIndex]);

  const channelProgress = useCallback((channelId: string) => {
    const vids = channelVideos(channelId);
    return { watched: vids.filter(v => watched.has(v.id)).length, total: vids.length };
  }, [channelVideos, watched]);

  const categories = useMemo(() => (viewingAge ? catalogs[viewingAge] : []), [viewingAge, catalogs]);

  // Unwatched videos for the viewing age, round-robin across channels so the feed feels varied
  const feed = useMemo(() => {
    if (!viewingAge) return [];
    const lists = [...indexes[viewingAge].values()].map(({ ch }) =>
      poolFor(ch).filter(v => !watched.has(v.id)).map(v => videoIndex.get(v.id)!).filter(Boolean));
    const out: Video[] = []; const seen = new Set<string>();
    for (let i = 0; lists.some(l => i < l.length); i++) {
      lists.forEach(l => { const v = l[i]; if (v && !seen.has(v.id)) { seen.add(v.id); out.push(v); } });
    }
    return out;
  }, [viewingAge, indexes, poolFor, watched, videoIndex]);

  // ---------------------------------------------------------------- fetching
  // First batch for one channel, unless one is already stored. Resolves to the video count.
  const fetchFirstBatch = useCallback(async (chId: string) => {
    const existing = readPool(chId);
    if (existing) return existing.length;
    const { videos, nextPageToken } = await fetchChannelVideos(chId);
    if (videos.length) {
      store.set(KEYS.pool(chId), videos);
      store.set(KEYS.nextToken(chId), nextPageToken);
      setPools(p => ({ ...p, [chId]: videos }));
    }
    return videos.length;
  }, []);

  const bulkFetch = useCallback(async (age: AgeId) => {
    if (store.get(KEYS.bulkDone(age))) return;
    setLoadingAge(age); setLoadedChannels(new Set());
    await Promise.all(channelIdsOf(catalogs[age]).map(async chId => {
      await fetchFirstBatch(chId);
      setLoadedChannels(prev => new Set(prev).add(chId));
    }));
    store.set(KEYS.bulkDone(age), true);
    setLoadingAge(null);
  }, [catalogs, fetchFirstBatch]);

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

  // ---------------------------------------------------------------- grown-up channels
  const curatedIds = useMemo(() => new Set(allCuratedChannelIds()), []);

  // Why a resolved channel can't be added, if it can't
  const duplicateOf = useCallback((channelId: string): ChannelFailure | null => {
    if (customChannels.some(c => c.channelId === channelId)) return fail('This channel is already on the hub.');
    if (curatedIds.has(channelId)) {
      return hiddenChannels.includes(channelId)
        ? fail('This channel is already on the hub, but you hid it. Restore it instead?', channelId)
        : fail('This channel is already on the hub.');
    }
    return null;
  }, [customChannels, hiddenChannels, curatedIds]);

  const lookupChannel = useCallback(async (url: string): Promise<LookupResult> => {
    const ref = parseChannelInput(url);
    if (!ref) return fail("That doesn't look like a YouTube channel link.");
    if (!YT_KEY && ref.kind !== 'id') {
      return fail('Without a YouTube API key only channel links with an ID work, like youtube.com/channel/UC…');
    }
    let channel;
    try {
      channel = await resolveChannel(ref);
    } catch (e) {
      console.error('resolveChannel:', e);
      return fail("We couldn't reach YouTube. Check the connection and try again.");
    }
    if (!channel) return fail("We couldn't find that channel.");
    return duplicateOf(channel.channelId) ?? { ok: true, channel, needsName: !channel.name };
  }, [duplicateOf]);

  const addChannel = useCallback(async (input: AddChannelInput): Promise<AddResult> => {
    let resolved = input.resolved;
    if (!resolved) {
      const r = await lookupChannel(input.url);
      if (!r.ok) return r;
      resolved = r.channel;
    }
    const dup = duplicateOf(resolved.channelId);
    if (dup) return dup;

    const name = input.name?.trim() || resolved.name;
    if (!name) return fail('Type a name for this channel.');
    const ageIds = AGE_ORDER.filter(a => input.ageIds.includes(a));
    if (!ageIds.length) return fail('Pick at least one age group.');
    const typed = input.category.trim();
    if (!typed) return fail('Pick a category.');
    // Reuse an existing category if only the capitalisation differs
    const category = allCategoryNames(customChannels).find(c => c.toLowerCase() === typed.toLowerCase()) ?? typed;

    const channel: CustomChannel = {
      channelId: resolved.channelId, name, category, ageIds,
      why: input.why?.trim() || DEFAULT_WHY,
      thumb: resolved.thumb,
      addedAt: Date.now(),
    };
    setCustom(prev => {
      const next = [...prev.filter(c => c.channelId !== channel.channelId), channel];
      store.set(KEYS.customChannels, next);
      return next;
    });
    // Fetch its first batch now so it's in the feed straight away
    const videos = await fetchFirstBatch(channel.channelId);
    return { ok: true, name, videos };
  }, [lookupChannel, duplicateOf, customChannels, fetchFirstBatch]);

  const removeChannel = useCallback((channelId: string) => {
    if (customChannels.some(c => c.channelId === channelId)) {
      const next = customChannels.filter(c => c.channelId !== channelId);
      store.set(KEYS.customChannels, next); setCustom(next);
      store.remove(KEYS.pool(channelId)); store.remove(KEYS.nextToken(channelId));
      setPools(p => { const n = { ...p }; delete n[channelId]; return n; });
    } else if (curatedIds.has(channelId) && !hiddenChannels.includes(channelId)) {
      const next = [...hiddenChannels, channelId];
      store.set(KEYS.hiddenChannels, next); setHidden(next);
    }
  }, [customChannels, hiddenChannels, curatedIds]);

  const restoreChannel = useCallback((channelId: string) => {
    const next = hiddenChannels.filter(id => id !== channelId);
    store.set(KEYS.hiddenChannels, next); setHidden(next);
    // The pool may never have been fetched if it was hidden before its age loaded
    void fetchFirstBatch(channelId);
  }, [hiddenChannels, fetchFirstBatch]);

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
    categories, ageCategories, channelInfo, feed, getVideo, channelVideos, channelProgress, refilling,
    watched, history, saved, stars,
    level: Math.floor(stars / STARS_PER_LEVEL) + 1,
    levelProgress: (stars % STARS_PER_LEVEL) / STARS_PER_LEVEL,
    streak, watchedToday, mastered,
    customChannels, hiddenChannels, hasApiKey: !!YT_KEY,
    lookupChannel, addChannel, removeChannel, restoreChannel,
    chooseAge, unlockAge, browseAge, setMaxAge, setPin, finishVideo, toggleSaved, resetToOnboarding,
  };

  return <JourneyContext.Provider value={value}>{children}</JourneyContext.Provider>;
}
