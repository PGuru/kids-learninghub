import type { Video } from '../types';
import { useJourney } from '../state/journey-context';
import VideoTile from './VideoTile';
import './HomeFeed.css';
import './ListPage.css';

interface Props {
  kind: 'history' | 'saved';
  onOpen(id: string): void;
  onOpenChannel(channelId: string): void;
}

const DAY = 24 * 60 * 60 * 1000;

function bucketOf(at: number, todayStart: number) {
  if (at >= todayStart) return 'Today';
  if (at >= todayStart - DAY) return 'Yesterday';
  return 'Earlier';
}

export default function ListPage({ kind, onOpen, onOpenChannel }: Props) {
  const j = useJourney();
  const savedSet = new Set(j.saved);

  const tile = (v: Video) => (
    <VideoTile
      key={v.id}
      video={v}
      onOpen={onOpen}
      onOpenChannel={onOpenChannel}
      watched={j.watched.has(v.id)}
      saved={savedSet.has(v.id)}
      onToggleSaved={j.toggleSaved}
    />
  );

  if (kind === 'saved') {
    const videos = j.saved.map(id => j.getVideo(id)).filter((v): v is Video => !!v);
    return (
      <div className="list">
        <header className="list__header">
          <h1 className="list__title"><span aria-hidden="true">🔖</span> Watch later</h1>
          {videos.length > 0 && (
            <p className="list__sub">
              {videos.length} {videos.length === 1 ? 'video' : 'videos'} saved. Tap the bookmark to take one off the list.
            </p>
          )}
        </header>
        {videos.length > 0 ? (
          <div className="feed__grid">{videos.map(tile)}</div>
        ) : (
          <div className="feed__empty">
            <span className="feed__empty-icon" aria-hidden="true">🔖</span>
            <h3>Nothing saved yet</h3>
            <p>See a video you like? Tap the bookmark on it and it will wait for you here.</p>
          </div>
        )}
      </div>
    );
  }

  // History: dedupe (most recent first), then group by day
  const seen = new Set<string>();
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const groups = new Map<string, Video[]>([['Today', []], ['Yesterday', []], ['Earlier', []]]);

  for (const entry of j.history) {
    if (seen.has(entry.id)) continue;
    const v = j.getVideo(entry.id);
    if (!v) continue;
    seen.add(entry.id);
    groups.get(bucketOf(entry.at, todayStart))!.push(v);
  }

  return (
    <div className="list">
      <header className="list__header">
        <h1 className="list__title"><span aria-hidden="true">🕒</span> Keep watching</h1>
        {seen.size > 0 && (
          <p className="list__sub">
            You have watched {seen.size} {seen.size === 1 ? 'video' : 'videos'}. Watch one again any time.
          </p>
        )}
      </header>

      {seen.size === 0 ? (
        <div className="feed__empty">
          <span className="feed__empty-icon" aria-hidden="true">🕒</span>
          <h3>No videos watched yet</h3>
          <p>Pick a video on the home page and finish it. It will show up here so you can find it again.</p>
        </div>
      ) : (
        [...groups].filter(([, vs]) => vs.length > 0).map(([label, vs]) => (
          <section className="list__group" key={label} aria-labelledby={`list-${label}`}>
            <h2 className="list__h2" id={`list-${label}`}>{label}</h2>
            <div className="feed__grid">
              {vs.map(v => (
                <VideoTile
                  key={v.id}
                  video={v}
                  onOpen={onOpen}
                  onOpenChannel={onOpenChannel}
                  watched
                  saved={savedSet.has(v.id)}
                  onToggleSaved={j.toggleSaved}
                />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
