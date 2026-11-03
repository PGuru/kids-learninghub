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

/**
 * Fetch up to 25 videos for one channel via its uploads playlist.
 * Pass pageToken to resume where the last batch ended. Quota: 2 units per call.
 */
export async function fetchChannelVideos(channelId: string, pageToken = ''): Promise<{ videos: FetchedVideo[]; nextPageToken: string }> {
  const empty = { videos: [], nextPageToken: '' };
  if (!YT_KEY) return empty;
  try {
    const chRes  = await fetch(`https://www.googleapis.com/youtube/v3/channels?key=${YT_KEY}&id=${channelId}&part=contentDetails`);
    const chData = await chRes.json();
    const uploadsId = chData?.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
    if (!uploadsId) return empty;

    const params = new URLSearchParams({ key: YT_KEY, playlistId: uploadsId, part: 'snippet,status', maxResults: '25', ...(pageToken ? { pageToken } : {}) });
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

    return { videos, nextPageToken: plData.nextPageToken || '' };
  } catch (e) {
    console.error('fetchChannelVideos:', e);
    return empty;
  }
}
