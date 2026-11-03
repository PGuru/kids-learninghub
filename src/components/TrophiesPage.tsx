import { useMemo } from 'react';
import type { Channel } from '../types';
import { STARS_PER_LEVEL, useJourney } from '../state/journey-context';
import './TrophiesPage.css';

interface Props { onOpenChannel(channelId: string): void }

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

export default function TrophiesPage({ onOpenChannel }: Props) {
  const j = useJourney();

  const starsToNext = STARS_PER_LEVEL - (j.stars % STARS_PER_LEVEL);
  const pct = Math.round(j.levelProgress * 100);

  // Which of the last 7 days had at least one finished video
  const { history } = j;
  const week = useMemo(() => {
    const active = new Set(history.map(h => dayKey(new Date(h.at))));
    const days: { key: string; label: string; full: string; done: boolean; today: boolean }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() - i);
      const key = dayKey(d);
      days.push({
        key,
        label: i === 0 ? 'Today' : d.toLocaleDateString(undefined, { weekday: 'short' }),
        full: i === 0 ? 'Today' : d.toLocaleDateString(undefined, { weekday: 'long' }),
        done: active.has(key),
        today: i === 0,
      });
    }
    return days;
  }, [history]);

  const channels = useMemo(() => {
    const seen = new Set<string>();
    const out: Channel[] = [];
    j.categories.forEach(cat => cat.channels.forEach(ch => {
      if (!seen.has(ch.channelId)) { seen.add(ch.channelId); out.push(ch); }
    }));
    return out;
  }, [j.categories]);

  const masteredHere = channels.filter(c => j.mastered.includes(c.channelId)).length;

  const streakNote =
    j.streak === 0 ? 'Watch a video today to start a streak!'
    : j.watchedToday ? 'You watched today. Great job!'
    : 'Watch one today to keep it going!';

  return (
    <div className="trophies">
      <h1 className="trophies__title">My trophies</h1>

      <div className="trophies__top">
        <section className="trophies__card trophies__level" aria-labelledby="tr-level">
          <div className="trophies__level-badge" aria-hidden="true">{j.level}</div>
          <div className="trophies__level-body">
            <h2 id="tr-level" className="trophies__card-title">Level {j.level}</h2>
            <p className="trophies__big"><span aria-hidden="true">⭐</span> {j.stars} stars</p>
            <div
              className="trophies__bar"
              role="progressbar"
              aria-label={`Progress to level ${j.level + 1}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={pct}
            >
              <span className="trophies__bar-fill" style={{ width: `${pct}%` }} />
            </div>
            <p className="trophies__note">{starsToNext} stars to level {j.level + 1}</p>
          </div>
        </section>

        <section className="trophies__card trophies__streak" aria-labelledby="tr-streak">
          <h2 id="tr-streak" className="trophies__card-title">
            <span aria-hidden="true">🔥</span> {j.streak} day streak
          </h2>
          <p className="trophies__note">{streakNote}</p>
          <ol className="trophies__week" aria-label="Last 7 days">
            {week.map(d => (
              <li key={d.key} className="trophies__day">
                <span
                  className={`trophies__dot${d.done ? ' trophies__dot--on' : ''}${d.today ? ' trophies__dot--today' : ''}`}
                  aria-hidden="true"
                >
                  {d.done ? '🔥' : ''}
                </span>
                <span className="trophies__day-label" aria-hidden="true">{d.label}</span>
                <span className="visually-hidden">{d.full}: {d.done ? 'watched a video' : 'no video'}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="trophies__card trophies__stats" aria-label="My numbers">
          <div className="trophies__stat">
            <span className="trophies__stat-num">{j.watched.size}</span>
            <span className="trophies__stat-label">videos watched</span>
          </div>
          <div className="trophies__stat">
            <span className="trophies__stat-num">{masteredHere}</span>
            <span className="trophies__stat-label">channel badges</span>
          </div>
        </section>
      </div>

      <section className="trophies__badges" aria-labelledby="tr-badges">
        <h2 id="tr-badges" className="trophies__section-title">Channel badges</h2>
        <p className="trophies__note">Finish every video in a channel's batch to win its badge.</p>
        <ul className="trophies__grid">
          {channels.map(ch => {
            const done = j.mastered.includes(ch.channelId);
            const p = j.channelProgress(ch.channelId);
            const label = done
              ? `${ch.name}: badge won. Open channel`
              : `${ch.name}: ${p.watched} of ${p.total} watched. Open channel`;
            return (
              <li key={ch.channelId}>
                <button
                  type="button"
                  className={`trophies__badge${done ? ' trophies__badge--won' : ''}`}
                  onClick={() => onOpenChannel(ch.channelId)}
                  aria-label={label}
                >
                  <span className="trophies__badge-avatar" aria-hidden="true">
                    {done ? '🏆' : ch.name.charAt(0)}
                  </span>
                  <span className="trophies__badge-name">{ch.name}</span>
                  {done ? (
                    <span className="trophies__badge-meta">Badge won!</span>
                  ) : (
                    <>
                      <span className="trophies__badge-meta">{p.watched} / {p.total}</span>
                      <span className="trophies__mini-bar" aria-hidden="true">
                        <span style={{ width: `${p.total ? (p.watched / p.total) * 100 : 0}%` }} />
                      </span>
                    </>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
