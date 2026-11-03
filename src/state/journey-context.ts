import { createContext, useContext } from 'react';
import type { AgeId, Category, CustomChannel, FinishResult, Video } from '../types';
import type { ResolvedChannel } from '../lib/youtube';

export const STARS_PER_VIDEO = 10;
export const STREAK_BONUS    = 5;   // extra stars for the first finish of the day
export const STARS_PER_LEVEL = 100;

export interface HistoryEntry { id: string; at: number }

export interface ChannelInfo { name: string; why: string; category: string }

/** `restorable`: the link is a curated channel the grown-up hid — offer Restore instead */
export type ChannelFailure = { ok: false; error: string; restorable?: string };
export type LookupResult = { ok: true; channel: ResolvedChannel; needsName: boolean } | ChannelFailure;
export type AddResult = { ok: true; name: string; videos: number } | ChannelFailure;

export interface AddChannelInput {
  url: string;
  ageIds: AgeId[];
  category: string;
  why?: string;
  name?: string;               // required when the channel couldn't be looked up (no API key)
  resolved?: ResolvedChannel;  // result of lookupChannel(url), saves a second API call
}

export interface Journey {
  // --- Age / parental ---
  maxAge: AgeId | null;      // null => first run, show onboarding
  viewingAge: AgeId | null;
  pin: string;
  loadingAge: AgeId | null;  // bulk fetch in progress for this age
  loadedChannels: Set<string>; // channels resolved during the current bulk fetch

  // --- Content for the viewing age ---
  categories: Category[];    // effective catalogue (curated − hidden + custom) for viewingAge
  ageCategories: (age: AgeId) => Category[]; // effective catalogue for any age
  channelInfo: (channelId: string) => ChannelInfo | undefined; // any age; falls back to curated even if hidden
  feed: Video[];             // unwatched videos, interleaved across channels
  getVideo: (id: string) => Video | undefined; // any known video, any age
  channelVideos: (channelId: string) => Video[]; // full current batch (watched + unwatched)
  channelProgress: (channelId: string) => { watched: number; total: number };
  refilling: Set<string>;    // channelIds currently fetching their next batch

  // --- Progress / engagement ---
  watched: Set<string>;
  history: HistoryEntry[];   // most recent first
  saved: string[];
  stars: number;
  level: number;
  levelProgress: number;     // 0..1 towards next level
  streak: number;            // consecutive days with a finished video (0 if broken)
  watchedToday: boolean;
  mastered: string[];        // channelIds

  // --- Grown-up channel changes (per device) ---
  customChannels: CustomChannel[];
  hiddenChannels: string[];  // curated channelIds hidden in every age group
  hasApiKey: boolean;        // without it only UC… IDs can be added, and they get no videos
  lookupChannel: (url: string) => Promise<LookupResult>;
  addChannel: (input: AddChannelInput) => Promise<AddResult>;
  removeChannel: (channelId: string) => void;  // custom → deleted; curated → hidden
  restoreChannel: (channelId: string) => void; // un-hide a curated channel

  // --- Actions ---
  chooseAge: (id: AgeId) => Promise<void>;  // first-run selection (bulk-fetches if needed)
  unlockAge: (id: AgeId) => Promise<void>;  // after PIN success: raise ceiling + switch
  browseAge: (id: AgeId) => void;           // switch to an age <= ceiling
  setMaxAge: (id: AgeId) => void;           // parent settings
  setPin: (pin: string) => void;
  finishVideo: (id: string) => FinishResult;
  toggleSaved: (id: string) => void;
  resetToOnboarding: () => void;
}

export const JourneyContext = createContext<Journey | null>(null);

export function useJourney(): Journey {
  const j = useContext(JourneyContext);
  if (!j) throw new Error('useJourney must be used inside <JourneyProvider>');
  return j;
}
