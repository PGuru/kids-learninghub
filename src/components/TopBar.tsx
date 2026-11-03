import { useEffect, useRef, useState } from 'react';
import { useJourney } from '../state/journey-context';
import './TopBar.css';

interface Props {
  query: string;
  onSearch(q: string): void;
  onMenu(): void;
  onHome(): void;
  onOpenTrophies(): void;
  onOpenParent(): void;
}

const RING_R = 15;
const RING_C = 2 * Math.PI * RING_R;

export default function TopBar({ query, onSearch, onMenu, onHome, onOpenTrophies, onOpenParent }: Props) {
  const j = useJourney();
  const [searchOpen, setSearchOpen] = useState(false); // mobile only
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  const streakTitle = j.streak === 0
    ? 'No streak yet. Watch a video today to start one'
    : j.watchedToday
      ? `${j.streak} day streak. You watched one today!`
      : `${j.streak} day streak. Watch one today to keep it`;

  const progress = Math.max(0, Math.min(1, j.levelProgress));

  const closeSearch = () => {
    setSearchOpen(false);
  };

  return (
    <header className={`topbar${searchOpen ? ' topbar--searching' : ''}`}>
      <div className="topbar__start">
        <button type="button" className="btn btn--ghost btn--icon topbar__menu" aria-label="Open menu" onClick={onMenu}>
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </button>
        <button type="button" className="topbar__brand" onClick={onHome} aria-label="Knowledge Journey, go home">
          <span className="topbar__mark" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M8 5.5v13l10.5-6.5z" fill="#fff" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="topbar__wordmark">Knowledge Journey</span>
        </button>
      </div>

      <form
        className="topbar__search"
        role="search"
        onSubmit={e => { e.preventDefault(); inputRef.current?.blur(); }}
      >
        <button
          type="button"
          className="btn btn--ghost btn--icon topbar__search-back"
          aria-label="Close search"
          onClick={closeSearch}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="topbar__field">
          <label htmlFor="topbar-search" className="visually-hidden">Search videos</label>
          <svg className="topbar__field-icon" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="2.5" />
            <path d="M16 16l4.5 4.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            id="topbar-search"
            type="search"
            value={query}
            placeholder="Search videos"
            autoComplete="off"
            enterKeyHint="search"
            onChange={e => onSearch(e.target.value)}
            onKeyDown={e => { if (e.key === 'Escape') { onSearch(''); closeSearch(); } }}
          />
          {query && (
            <button
              type="button"
              className="topbar__clear"
              aria-label="Clear search"
              onClick={() => { onSearch(''); inputRef.current?.focus(); }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
      </form>

      <div className="topbar__end">
        <button
          type="button"
          className="btn btn--ghost btn--icon topbar__search-toggle"
          aria-label="Search videos"
          aria-expanded={searchOpen}
          onClick={() => setSearchOpen(true)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="2.5" />
            <path d="M16 16l4.5 4.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          {query && <span className="topbar__search-dot" aria-hidden="true" />}
        </button>

        <span
          className={`topbar__streak${j.watchedToday ? '' : ' topbar__streak--dim'}`}
          title={streakTitle}
          role="img"
          aria-label={streakTitle}
        >
          <span aria-hidden="true">🔥</span>
          <span className="topbar__num" aria-hidden="true">{j.streak}</span>
        </span>

        <button
          type="button"
          id="star-jar"
          className="topbar__jar"
          onClick={onOpenTrophies}
          aria-label={`${j.stars} stars, level ${j.level}. Open my trophies`}
        >
          <span className="topbar__stars">
            <span aria-hidden="true">⭐</span>
            <span className="topbar__num">{j.stars}</span>
          </span>
          <span className="topbar__level" aria-hidden="true">
            <svg className="topbar__ring" width="36" height="36" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r={RING_R} fill="none" stroke="var(--line)" strokeWidth="4" />
              <circle
                cx="18" cy="18" r={RING_R} fill="none"
                stroke="var(--sun)" strokeWidth="4" strokeLinecap="round"
                strokeDasharray={RING_C}
                strokeDashoffset={RING_C * (1 - progress)}
                transform="rotate(-90 18 18)"
              />
            </svg>
            <span className="topbar__level-text">
              <span className="topbar__lv">Lv</span>
              {j.level}
            </span>
          </span>
        </button>

        <button type="button" className="btn btn--ghost btn--icon topbar__parent" aria-label="Grown-ups" title="Grown-ups" onClick={onOpenParent}>
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="5" y="10.5" width="14" height="10" rx="2.5" fill="none" stroke="currentColor" strokeWidth="2.2" />
            <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" fill="none" stroke="currentColor" strokeWidth="2.2" />
            <circle cx="12" cy="15.5" r="1.5" fill="currentColor" />
          </svg>
        </button>
      </div>
    </header>
  );
}
