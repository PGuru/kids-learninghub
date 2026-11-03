// Thin localStorage wrapper. Every read/write is guarded so the app still works
// in private windows or sandboxes where storage throws.
export const store = {
  get<T>(k: string): T | null {
    try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : null; } catch { return null; }
  },
  set(k: string, v: unknown) {
    try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ }
  },
  remove(k: string) {
    try { localStorage.removeItem(k); } catch { /* ignore */ }
  },
};

export const KEYS = {
  maxAge:     'kj_maxAge',
  viewingAge: 'kj_viewingAge',
  pin:        'kj_pin',
  watched:    'kj_watched',  // string[] — watched video IDs across all channels
  history:    'kj_history',  // { id, at }[] — most recent first
  saved:      'kj_saved',    // string[] — "watch later"
  stars:      'kj_stars',    // number
  streak:     'kj_streak',   // { count, lastDay: 'YYYY-MM-DD' }
  mastered:   'kj_mastered', // string[] — channelIds whose batch was fully watched
  bulkDone:   (ageId: string) => `kj_bulkDone_${ageId}`,
  pool:       (chId: string)  => `kj_pool_${chId}`,      // Video[] (legacy: string[])
  nextToken:  (chId: string)  => `kj_nextToken_${chId}`,
};
