import { useMemo, type CSSProperties } from 'react';
import type { AgeId } from '../types';
import { CATALOG, ageGroup } from '../data/catalog';
import { useJourney } from '../state/journey-context';
import './LoadingScreen.css';

function channelsFor(age: AgeId) {
  const seen = new Map<string, string>();
  CATALOG[age].forEach(cat => cat.channels.forEach(ch => {
    if (!seen.has(ch.channelId)) seen.set(ch.channelId, ch.name);
  }));
  return [...seen].map(([id, name]) => ({ id, name }));
}

export default function LoadingScreen() {
  const j = useJourney();
  const age = j.loadingAge;
  const channels = useMemo(() => (age ? channelsFor(age) : []), [age]);

  if (!age) return <div className="loading" />;

  const g = ageGroup(age);
  const total = channels.length;
  const done = channels.filter(c => j.loadedChannels.has(c.id)).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div
      className="loading"
      style={{ '--loading-accent': g.accent, '--loading-light': g.light } as CSSProperties}
    >
      <div className="loading__panel">
        <div className="loading__badge" aria-hidden="true">{g.emoji}</div>
        <p className="loading__age">{g.label}</p>
        <h1 className="loading__title">Getting your videos ready</h1>
        <p className="loading__sub">We're packing videos from {total} channels for you.</p>

        <div
          className="loading__bar"
          role="progressbar"
          aria-label="Channels ready"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={done}
          aria-valuetext={`${done} of ${total} channels ready`}
        >
          <span className={`loading__fill${done === 0 ? ' loading__fill--empty' : ''}`} style={{ width: `${pct}%` }} />
        </div>
        <p className="loading__count">{done} of {total} ready</p>

        <ul className="loading__list">
          {channels.map(c => {
            const ready = j.loadedChannels.has(c.id);
            return (
              <li key={c.id} className={`loading__pill${ready ? ' loading__pill--ready' : ''}`}>
                <span className="loading__mark" aria-hidden="true">{ready ? '✓' : ''}</span>
                {c.name}
                <span className="visually-hidden">{ready ? ', ready' : ', waiting'}</span>
              </li>
            );
          })}
        </ul>

        <p className="loading__note">This only happens once.</p>
      </div>
    </div>
  );
}
