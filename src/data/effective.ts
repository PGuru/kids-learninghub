// The "effective" catalogue: the curated CATALOG with the grown-up's changes applied
// (hidden channels removed, added channels appended). Everything that lists channels
// should go through here rather than reading CATALOG directly.
import type { AgeId, Category, Channel, CustomChannel } from '../types';
import { AGE_ORDER, CATALOG } from './catalog';

export const DEFAULT_WHY = 'Added by a grown-up';

export const customToChannel = (c: CustomChannel): Channel => ({
  name: c.name,
  channelId: c.channelId,
  why: c.why.trim() || DEFAULT_WHY,
  videos: [], // no fallback IDs: videos come from the API pool only
});

/**
 * CATALOG[age] minus hidden channels (empty categories dropped), plus the custom channels
 * for this age appended to their category. Curated category order is kept; new
 * categories follow in the order they were first used.
 */
export function effectiveCatalog(
  age: AgeId,
  custom: readonly CustomChannel[],
  hidden: readonly string[],
): Category[] {
  const hide = new Set(hidden);
  const out: Category[] = CATALOG[age].map(cat => ({
    category: cat.category,
    channels: cat.channels.filter(ch => !hide.has(ch.channelId)),
  }));
  custom
    .filter(c => c.ageIds.includes(age) && !hide.has(c.channelId))
    .forEach(c => {
      let cat = out.find(x => x.category === c.category);
      if (!cat) { cat = { category: c.category, channels: [] }; out.push(cat); }
      if (!cat.channels.some(ch => ch.channelId === c.channelId)) cat.channels.push(customToChannel(c));
    });
  return out.filter(cat => cat.channels.length > 0);
}

/** Unique channelIds in a list of categories, in display order */
export function channelIdsOf(categories: readonly Category[]): string[] {
  const seen = new Set<string>();
  categories.forEach(cat => cat.channels.forEach(ch => seen.add(ch.channelId)));
  return [...seen];
}

/** channelId -> { ch, category } for a list of categories; first occurrence wins */
export function channelIndexOf(categories: readonly Category[]) {
  const map = new Map<string, { ch: Channel; category: string }>();
  categories.forEach(cat => cat.channels.forEach(ch => {
    if (!map.has(ch.channelId)) map.set(ch.channelId, { ch, category: cat.category });
  }));
  return map;
}

/** First curated entry for a channel in any age group (ignores hidden/custom) */
export function curatedChannel(channelId: string): { ch: Channel; category: string } | undefined {
  for (const age of AGE_ORDER) {
    const hit = channelIndexOf(CATALOG[age]).get(channelId);
    if (hit) return hit;
  }
  return undefined;
}

/** Every curated channelId across all age groups */
export function allCuratedChannelIds(): string[] {
  const seen = new Set<string>();
  AGE_ORDER.forEach(age => channelIdsOf(CATALOG[age]).forEach(id => seen.add(id)));
  return [...seen];
}

/** Curated category names (catalogue order) followed by any new ones grown-ups created */
export function allCategoryNames(custom: readonly CustomChannel[]): string[] {
  const seen = new Set<string>();
  AGE_ORDER.forEach(age => CATALOG[age].forEach(cat => seen.add(cat.category)));
  custom.forEach(c => seen.add(c.category));
  return [...seen];
}
