// YouTube Data API v3. Set VITE_YOUTUBE_API_KEY in .env.local.
export const YT_KEY: string | null = import.meta.env.VITE_YOUTUBE_API_KEY || null;

export const thumbUrl = (id: string, size: 'mq' | 'hq' = 'mq') =>
  `https://img.youtube.com/vi/${id}/${size}default.jpg`;

export interface FetchedVideo { id: string; title: string; thumb: string; publishedAt?: string }

interface PlaylistItem {
  snippet?: {
    title?: string;
    publishedAt?: string;
    defaultAudioLanguage?: string;
    defaultLanguage?: string;
    resourceId?: { kind?: string; videoId?: string };
    thumbnails?: { high?: { url: string }; medium?: { url: string } };
  };
  status?: { privacyStatus?: string };
}

// Longest video we show; filters out recorded 24h streams and full-length marathons
const MAX_SECONDS = 60 * 60;

// ISO 8601 duration ("PT1H2M3S") -> seconds
function isoSeconds(iso = ''): number {
  const m = iso.match(/P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  const [, d, h, min, s] = m.map(Number);
  return (d || 0) * 86400 + (h || 0) * 3600 + (min || 0) * 60 + (s || 0);
}

// Shorts can be up to 3 minutes; anything this short that is also vertical is treated as one
const SHORTS_MAX_SECONDS = 180;

interface VideoDetails {
  id: string;
  snippet?: { title?: string; liveBroadcastContent?: string };
  contentDetails?: { duration?: string };
  player?: { embedWidth?: string | number; embedHeight?: string | number };
}

// The API has no "is a Short" flag. Shorts are vertical and ≤3 min; very short clips and
// #shorts-tagged uploads count too.
function isShort(v: VideoDetails, secs: number): boolean {
  const w = Number(v.player?.embedWidth), h = Number(v.player?.embedHeight);
  const vertical = w > 0 && h > w;
  return secs <= 60 || (vertical && secs <= SHORTS_MAX_SECONDS) || /#shorts?\b/i.test(v.snippet?.title ?? '');
}

/**
 * Keep only videos a kid can watch and "finish": drop Shorts, livestreams, upcoming
 * premieres/streams and anything over an hour. playlistItems doesn't say, so look them up
 * via videos.list (1 unit; `player` with maxWidth returns the embed's aspect ratio).
 * On failure the list is returned unfiltered.
 */
async function keepWatchable(videos: FetchedVideo[]): Promise<FetchedVideo[]> {
  if (!videos.length || !YT_KEY) return videos;
  try {
    const params = new URLSearchParams({ key: YT_KEY, id: videos.map(v => v.id).join(','), part: 'snippet,contentDetails,player', maxWidth: '480' });
    const res  = await fetch(`https://www.googleapis.com/youtube/v3/videos?${params}`);
    const data = await res.json();
    if (!Array.isArray(data.items)) return videos;
    const ok = new Set<string>(
      (data.items as VideoDetails[])
        .filter(v => {
          const secs = isoSeconds(v.contentDetails?.duration);
          return (v.snippet?.liveBroadcastContent ?? 'none') === 'none' && secs > 0 && secs <= MAX_SECONDS && !isShort(v, secs);
        })
        .map(v => v.id),
    );
    return videos.filter(v => ok.has(v.id));
  } catch (e) {
    console.error('keepWatchable:', e);
    return videos;
  }
}

// ------------------------------------------------------------------ channel links

/** What a pasted link or ID points at, before asking the API who it is */
export type ChannelRef =
  | { kind: 'id'; value: string }      // UC… channel ID
  | { kind: 'handle'; value: string }  // @handle (value includes the @)
  | { kind: 'user'; value: string }    // legacy /user/Name
  | { kind: 'custom'; value: string }  // legacy /c/Name or youtube.com/Name
  | { kind: 'video'; value: string };  // 11-char video ID

const CHANNEL_ID = /^UC[\w-]{22}$/;
const VIDEO_ID   = /^[\w-]{11}$/;
const HANDLE     = /^@[\p{L}\p{N}._·-]{3,100}$/u;
const YT_HOSTS   = /^(?:www\.|m\.|music\.)?(?:youtube\.com|youtube-nocookie\.com)$/i;
// First path segments that are YouTube pages, not legacy vanity channel names
const RESERVED = new Set(['watch', 'results', 'playlist', 'feed', 'embed', 'shorts', 'live', 'channel', 'c', 'user', 'hashtag', 'account', 'premium', 'kids', 'gaming', 'about', 'signin', 'logout', 'redirect']);

const safeDecode = (s: string) => { try { return decodeURIComponent(s); } catch { return s; } };

/**
 * Recognise a YouTube channel (or video) from whatever a grown-up pastes:
 * channel URLs (@handle, /channel/UC…, /c/Name, /user/Name, youtube.com/Name), bare
 * `@handle` or `UC…` IDs, and video links (watch?v=, youtu.be/, /shorts/, /live/, /embed/)
 * on www., m. or music. hosts. Returns null if it isn't one.
 */
export function parseChannelInput(text: string): ChannelRef | null {
  const raw = text.trim();
  if (!raw) return null;
  if (CHANNEL_ID.test(raw)) return { kind: 'id', value: raw };
  if (HANDLE.test(raw)) return { kind: 'handle', value: raw };

  let url: URL;
  try { url = new URL(/^[a-z][a-z\d+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`); } catch { return null; }
  const host = url.hostname.toLowerCase();
  const parts = url.pathname.split('/').filter(Boolean).map(safeDecode);

  if (host === 'youtu.be' || host === 'www.youtu.be') {
    return parts[0] && VIDEO_ID.test(parts[0]) ? { kind: 'video', value: parts[0] } : null;
  }
  if (!YT_HOSTS.test(host)) return null;

  const [first = '', second = ''] = parts;
  if (first.startsWith('@')) return HANDLE.test(first) ? { kind: 'handle', value: first } : null;
  switch (first.toLowerCase()) {
    case 'channel': return CHANNEL_ID.test(second) ? { kind: 'id', value: second } : null;
    case 'c':       return second ? { kind: 'custom', value: second } : null;
    case 'user':    return second ? { kind: 'user', value: second } : null;
    case 'watch': {
      const v = url.searchParams.get('v') ?? '';
      return VIDEO_ID.test(v) ? { kind: 'video', value: v } : null;
    }
    case 'shorts': case 'live': case 'embed': case 'v':
      return VIDEO_ID.test(second) ? { kind: 'video', value: second } : null;
  }
  // youtube.com/SomeName — old-style vanity URL, resolved like /c/
  if (parts.length >= 1 && !RESERVED.has(first.toLowerCase()) && /^[\p{L}\p{N}_.-]+$/u.test(first)) {
    return { kind: 'custom', value: first };
  }
  return null;
}

export interface ResolvedChannel {
  channelId: string;
  name: string;         // '' when it couldn't be looked up (no API key)
  description: string;
  thumb?: string;
}

interface ChannelSnippet {
  title?: string;
  description?: string;
  thumbnails?: { default?: { url: string }; medium?: { url: string } };
}

const API = 'https://www.googleapis.com/youtube/v3';

async function api(path: string, params: Record<string, string>) {
  const qs = new URLSearchParams({ key: YT_KEY ?? '', ...params });
  const res = await fetch(`${API}/${path}?${qs}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || `YouTube API error ${res.status}`);
  return data;
}

const toResolved = (channelId: string, s: ChannelSnippet = {}): ResolvedChannel => ({
  channelId,
  name: s.title?.trim() || '',
  description: s.description?.trim() || '',
  thumb: s.thumbnails?.medium?.url || s.thumbnails?.default?.url,
});

async function channelBy(params: Record<string, string>): Promise<ResolvedChannel | null> {
  const data = await api('channels', { part: 'snippet', ...params });
  const item = data?.items?.[0] as { id?: string; snippet?: ChannelSnippet } | undefined;
  return item?.id ? toResolved(item.id, item.snippet) : null;
}

/**
 * Turn a parsed link into a channel via the Data API. Returns null when YouTube has no
 * such channel; throws on network/quota errors. Costs: 1 unit for handles, IDs, users and
 * videos (2 for videos); 100 for /c/ names, which need a search.
 * Without an API key only `id` refs resolve, with an empty name.
 */
export async function resolveChannel(ref: ChannelRef): Promise<ResolvedChannel | null> {
  if (!YT_KEY) {
    if (ref.kind === 'id') return { channelId: ref.value, name: '', description: '' };
    throw new Error('NO_KEY');
  }
  switch (ref.kind) {
    case 'id':     return channelBy({ id: ref.value });
    case 'handle': return channelBy({ forHandle: ref.value });
    case 'user':   return channelBy({ forUsername: ref.value });
    case 'video': {
      const data = await api('videos', { part: 'snippet', id: ref.value });
      const chId = data?.items?.[0]?.snippet?.channelId as string | undefined;
      return chId ? channelBy({ id: chId }) : null;
    }
    case 'custom': {
      const data = await api('search', { part: 'snippet', type: 'channel', q: ref.value, maxResults: '1' });
      const item = data?.items?.[0] as { id?: { channelId?: string }; snippet?: ChannelSnippet & { channelId?: string } } | undefined;
      const chId = item?.id?.channelId || item?.snippet?.channelId;
      // search snippets carry only a low-res thumb; fetch the channel for a proper one
      return chId ? (await channelBy({ id: chId })) ?? toResolved(chId, item?.snippet) : null;
    }
  }
}

const MAX_PAGES = 4;       // upload pages read per fetch, at most
const TARGET_VIDEOS = 12;  // stop paging once this many watchable videos are found

/**
 * Fetch a batch of watchable videos (no Shorts/live/>1h) for one channel via its uploads
 * playlist, paging back until TARGET_VIDEOS are found. Pass pageToken to resume where the
 * last batch ended. Quota: 1 + 2 units per page read (usually 1 page, at most MAX_PAGES).
 */
export async function fetchChannelVideos(channelId: string, pageToken = ''): Promise<{ videos: FetchedVideo[]; nextPageToken: string }> {
  const empty = { videos: [], nextPageToken: '' };
  if (!YT_KEY) return empty;
  try {
    const chRes  = await fetch(`https://www.googleapis.com/youtube/v3/channels?key=${YT_KEY}&id=${channelId}&part=contentDetails`);
    const chData = await chRes.json();
    const uploadsId = chData?.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
    if (!uploadsId) return empty;

    // Shorts-heavy channels can yield few keepers per page, so read further back until
    // there are enough (each extra page costs 2 units)
    const kept: FetchedVideo[] = [];
    let token = pageToken;
    for (let page = 0; page < MAX_PAGES && kept.length < TARGET_VIDEOS; page++) {
      const { videos, next } = await fetchUploadsPage(uploadsId, token);
      kept.push(...await keepWatchable(videos));
      token = next;
      if (!token) break;
    }
    return { videos: kept, nextPageToken: token };
  } catch (e) {
    console.error('fetchChannelVideos:', e);
    return empty;
  }
}

async function fetchUploadsPage(uploadsId: string, pageToken: string): Promise<{ videos: FetchedVideo[]; next: string }> {
  const params = new URLSearchParams({ key: YT_KEY!, playlistId: uploadsId, part: 'snippet,status', maxResults: '25', ...(pageToken ? { pageToken } : {}) });
  const plRes  = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?${params}`);
  const plData = await plRes.json();
  const items: PlaylistItem[] = plData.items ?? [];

  const videos = items
    .filter(item => {
      const title = item.snippet?.title?.toLowerCase() || '';
      const lang  = item.snippet?.defaultAudioLanguage || item.snippet?.defaultLanguage || 'en';
      return item.snippet?.resourceId?.kind === 'youtube#video' &&
        item.status?.privacyStatus === 'public' &&
        !title.includes('deleted video') && !title.includes('private video') &&
        lang.startsWith('en');
    })
    .map(item => {
      const id = item.snippet!.resourceId!.videoId!;
      return {
        id,
        title: item.snippet!.title!,
        thumb: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.medium?.url || thumbUrl(id),
        publishedAt: item.snippet?.publishedAt,
      };
    });

  return { videos, next: plData.nextPageToken || '' };
}
