export type AgeId = '3-6' | '7-10' | '11-13' | '14-16';

export interface AgeGroup {
  id: AgeId;
  label: string;
  range: string;
  emoji: string;
  accent: string; // strong age colour
  light: string;  // tint of the age colour
}

export interface Channel {
  name: string;
  channelId: string;
  why: string;
  videos: string[]; // fallback video IDs
}

export interface Category {
  category: string;
  channels: Channel[];
}

/** A channel a grown-up added from a YouTube link (stored per device) */
export interface CustomChannel {
  channelId: string;
  name: string;
  why: string;
  category: string;
  ageIds: AgeId[];
  thumb?: string;   // channel avatar URL from the Data API
  addedAt: number;
}

export interface Video {
  id: string;
  title: string | null; // null when fetched without an API key (fallback IDs)
  thumb: string;
  channelId: string;
  channelName: string;
  category: string;
  publishedAt?: string;
}

export type View =
  | { name: 'home' }
  | { name: 'watch'; videoId: string }
  | { name: 'history' }
  | { name: 'saved' }
  | { name: 'trophies' }
  | { name: 'channel'; channelId: string };

// Result of finishing a video — drives the celebration UI
export interface FinishResult {
  starsEarned: number;
  totalStars: number;
  streak: number;
  streakExtended: boolean; // first finish of the day extended the streak
  levelUp: number | null;  // new level if the child levelled up
  channelMastered: string | null; // channel name if this finished its batch
}
