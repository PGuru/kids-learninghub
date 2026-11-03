import { useEffect, useRef } from 'react';
import type { AgeId, View } from '../types';
import { AGE_GROUPS, TIPS, ageIndex } from '../data/catalog';
import { useJourney } from '../state/journey-context';
import './SideRail.css';

interface Props {
  open: boolean;
  view: View;
  onNavigate(v: View): void;
  onPickAge(id: AgeId): void;
  onClose(): void;
}

type NavName = 'home' | 'history' | 'saved' | 'trophies';

const NAV: { name: NavName; label: string; icon: string }[] = [
  { name: 'home',     label: 'Home',          icon: '🏠' },
  { name: 'history',  label: 'Keep watching', icon: '🕒' },
  { name: 'saved',    label: 'Watch later',   icon: '🔖' },
  { name: 'trophies', label: 'My trophies',   icon: '🏆' },
];

export default function SideRail({ open, view, onNavigate, onPickAge, onClose }: Props) {
  const j = useJourney();
  const panelRef = useRef<HTMLElement>(null);

  // Escape closes the drawer
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Move focus into the drawer when it opens (drawer mode only)
  useEffect(() => {
    if (!open || window.matchMedia('(min-width: 1024px)').matches) return;
    panelRef.current?.querySelector<HTMLElement>('.rail__item--active, .rail__item')?.focus();
  }, [open]);

  const maxIdx = j.maxAge ? ageIndex(j.maxAge) : 0;

  return (
    <>
      <div
        className={`rail__backdrop${open ? ' rail__backdrop--open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <nav
        ref={panelRef}
        className={`rail${open ? ' rail--open' : ''}`}
        aria-label="Main"
      >
        <div className="rail__head">
          <span className="rail__head-title">Menu</span>
          <button type="button" className="btn btn--ghost btn--icon" aria-label="Close menu" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <ul className="rail__list">
          {NAV.map(item => {
            const active = view.name === item.name;
            const count = item.name === 'saved' ? j.saved.length : 0;
            return (
              <li key={item.name}>
                <button
                  type="button"
                  className={`rail__item${active ? ' rail__item--active' : ''}`}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => onNavigate({ name: item.name })}
                >
                  <span className="rail__icon" aria-hidden="true">{item.icon}</span>
                  <span className="rail__label">{item.label}</span>
                  {count > 0 && <span className="rail__count" aria-label={`${count} saved`}>{count}</span>}
                </button>
              </li>
            );
          })}
        </ul>

        <h2 className="rail__heading" id="rail-age">Age group</h2>
        <ul className="rail__list" aria-labelledby="rail-age">
          {AGE_GROUPS.map(g => {
            const current = j.viewingAge === g.id;
            const locked = ageIndex(g.id) > maxIdx;
            return (
              <li key={g.id}>
                <button
                  type="button"
                  className={`rail__item rail__age${current ? ' rail__item--active' : ''}${locked ? ' rail__age--locked' : ''}`}
                  aria-pressed={current}
                  aria-label={`${g.label}, ${g.range}${locked ? ', locked, ask a grown-up' : ''}`}
                  onClick={() => onPickAge(g.id)}
                >
                  <span className="rail__icon" aria-hidden="true">{g.emoji}</span>
                  <span className="rail__age-text" aria-hidden="true">
                    <span className="rail__label">{g.label}</span>
                    <span className="rail__range">{g.range}</span>
                  </span>
                  {locked && <span className="rail__lock" aria-hidden="true">🔒</span>}
                </button>
              </li>
            );
          })}
        </ul>

        {j.viewingAge && (
          <aside className="rail__tip" aria-label="Tip for grown-ups">
            <p className="rail__tip-title">Tip for grown-ups</p>
            <p>{TIPS[j.viewingAge]}</p>
          </aside>
        )}
      </nav>
    </>
  );
}
