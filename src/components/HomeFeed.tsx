import { useMemo, useState } from 'react';
import type { Video } from '../types';
import { CAT_ICONS, ageGroup } from '../data/catalog';
import { useJourney } from '../state/journey-context';
import VideoTile from './VideoTile';
import './HomeFeed.css';

interface Props {
  query: string;
  onClearSearch(): void;
  onOpen(id: string): void;
  onOpenChannel(channelId: string): void;
}

const ALL = 'All';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

const matches = (v: Video, q: string) =>
  (v.title ?? '').toLowerCase().includes(q) ||
  v.channelName.toLowerCase().includes(q) ||
  v.category.toLowerCase().includes(q);

export default function HomeFeed({ query, onClearSearch, onOpen, onOpenChannel }: Props) {
  const j = useJourney();
  const [picked, setPicked] = useState<string>(ALL);

  const group = j.viewingAge ? ageGroup(j.viewingAge) : null;
  const q = query.trim().toLowerCase();
  const searching = q.length > 0;

  // Fall back to All if the picked category isn't in this age group
  const category = picked === ALL || j.categories.some(c => c.category === picked) ? picked : ALL;

  const savedSet = useMemo(() => new Set(j.saved), [j.saved]);

  const remainingByCat = useMemo(() => {
    const m = new Map<string, number>();
    j.feed.forEach(v => m.set(v.category, (m.get(v.category) ?? 0) + 1));
    return m;
  }, [j.feed]);

  const videos = useMemo(
    () => j.feed.filter(v => (category === ALL || v.category === category) && (!searching || matches(v, q))),
    [j.feed, category, searching, q],
  );

  const savedVideos = j.saved.map(id => j.getVideo(id)).filter((v): v is Video => !!v);

  // Another category with videos left, for the "all done" empty state
  const suggestion = j.categories
    .map(c => c.category)
    .filter(c => c !== category && (remainingByCat.get(c) ?? 0) > 0)
    .sort((a, b) => (remainingByCat.get(b) ?? 0) - (remainingByCat.get(a) ?? 0))[0];

  const tileProps = (v: Video) => ({
    video: v,
    onOpen,
    onOpenChannel,
    watched: j.watched.has(v.id),
    saved: savedSet.has(v.id),
    onToggleSaved: j.toggleSaved,
  });

  return (
    <div className="feed">
      <header className="feed__header">
        <div className="feed__hello">
          <h1 className="feed__title">
            {greeting()}, explorer {group && <span aria-hidden="true">{group.emoji}</span>}
          </h1>
          {group && <p className="feed__sub">Fresh picks for {group.label.toLowerCase()} ({group.range.toLowerCase()})</p>}
        </div>

        <div className={`feed__mission${j.watchedToday ? ' feed__mission--done' : ''}`} role="status">
          <span className="feed__mission-icon" aria-hidden="true">{j.watchedToday ? '✅' : '🎯'}</span>
          <p className="feed__mission-text">
            {j.watchedToday
              ? 'Mission done! Come back tomorrow'
              : 'Daily mission: finish 1 video today to keep your 🔥 streak'}
          </p>
          <span className="feed__mission-streak" aria-label={`${j.streak} day streak`}>
            <span aria-hidden="true">🔥</span>
            <strong>{j.streak}</strong>
            <span className="feed__mission-days">{j.streak === 1 ? 'day' : 'days'}</span>
          </span>
        </div>
      </header>

      <div className="feed__chips" role="toolbar" aria-label="Pick a topic">
        <button type="button" className="chip" aria-pressed={category === ALL} onClick={() => setPicked(ALL)}>
          All
        </button>
        {j.categories.map(c => (
          <button
            key={c.category}
            type="button"
            className="chip"
            aria-pressed={category === c.category}
            onClick={() => setPicked(c.category)}
          >
            {CAT_ICONS[c.category] && <span aria-hidden="true">{CAT_ICONS[c.category]}</span>}
            {c.category}
          </button>
        ))}
      </div>

      {!searching && category === ALL && savedVideos.length > 0 && (
        <section className="feed__section" aria-labelledby="feed-saved">
          <h2 className="feed__h2" id="feed-saved">
            <span aria-hidden="true">🔖</span> Watch later
          </h2>
          <div className="feed__shelf">
            {savedVideos.map(v => (
              <div className="feed__shelf-item" key={v.id}>
                <VideoTile {...tileProps(v)} />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="feed__section" aria-labelledby="feed-main">
        <h2 className="feed__h2" id="feed-main">
          {searching
            ? `Results for "${query.trim()}"`
            : category === ALL
              ? 'Videos for you'
              : <><span aria-hidden="true">{CAT_ICONS[category]}</span> {category}</>}
        </h2>

        {videos.length > 0 ? (
          <div className="feed__grid">
            {videos.map(v => <VideoTile key={v.id} {...tileProps(v)} />)}
          </div>
        ) : searching ? (
          <div className="feed__empty">
            <span className="feed__empty-icon" aria-hidden="true">🔍</span>
            <h3>No videos match "{query.trim()}"</h3>
            <p>Try a shorter word, or look in another topic.</p>
            {category !== ALL && (
              <button type="button" className="btn" onClick={() => setPicked(ALL)}>Search all topics</button>
            )}
            <button type="button" className="btn btn--primary" onClick={onClearSearch}>Clear search</button>
          </div>
        ) : j.refilling.size > 0 ? (
          <div className="feed__empty">
            <span className="feed__empty-icon" aria-hidden="true">📦</span>
            <h3>Getting more videos ready</h3>
            <p>New videos are on their way. Hang on a moment!</p>
          </div>
        ) : (
          <div className="feed__empty feed__empty--yay">
            <span className="feed__empty-icon" aria-hidden="true">🎉</span>
            <h3>{category === ALL ? 'You watched them all!' : `You finished every ${category} video!`}</h3>
            {suggestion ? (
              <>
                <p>Amazing work. Want to try something new?</p>
                <button type="button" className="btn btn--age" onClick={() => setPicked(suggestion)}>
                  {CAT_ICONS[suggestion] && <span aria-hidden="true">{CAT_ICONS[suggestion]}</span>}
                  Try {suggestion}
                </button>
              </>
            ) : (
              <p>Amazing work. Come back soon for new videos.</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

