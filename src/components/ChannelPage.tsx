import { useMemo } from 'react';
import { useJourney } from '../state/journey-context';
import VideoTile from './VideoTile';
import './ChannelPage.css';

interface Props {
  channelId: string;
  onOpen(id: string): void;
}

export default function ChannelPage({ channelId, onOpen }: Props) {
  const j = useJourney();
  // A grown-up hid this channel: treat it as not on the hub
  const hidden = j.hiddenChannels.includes(channelId);
  const info = hidden ? undefined : j.channelInfo(channelId);
  const { channelVideos, watched } = j;

  const videos = useMemo(() => {
    if (hidden) return [];
    const all = channelVideos(channelId);
    return [...all.filter(v => !watched.has(v.id)), ...all.filter(v => watched.has(v.id))];
  }, [hidden, channelVideos, channelId, watched]);

  const name = info?.name ?? videos[0]?.channelName;
  if (!name) {
    return (
      <section className="channel channel--missing">
        <h1 className="channel__name">We couldn't find that channel</h1>
        <p className="channel__why">Try picking a video from the home page.</p>
      </section>
    );
  }

  const p = j.channelProgress(channelId);
  const pct = p.total ? Math.round((p.watched / p.total) * 100) : 0;
  const isMastered = j.mastered.includes(channelId);
  const isRefilling = j.refilling.has(channelId);

  return (
    <div className="channel">
      <header className="channel__header">
        <span className="channel__avatar" aria-hidden="true">{name.charAt(0)}</span>
        <div className="channel__head-text">
          <h1 className="channel__name">{name}</h1>
          {info?.why && <p className="channel__why">{info.why}</p>}
          {info?.category && <p className="channel__category">{info.category}</p>}

          <div className="channel__progress">
            <div
              className="channel__bar"
              role="progressbar"
              aria-label={`Videos watched from ${name}`}
              aria-valuemin={0}
              aria-valuemax={p.total}
              aria-valuenow={p.watched}
            >
              <span className="channel__bar-fill" style={{ width: `${pct}%` }} />
            </div>
            <p className="channel__progress-text">{p.watched} of {p.total} watched in this batch</p>
          </div>

          {isMastered && (
            <p className="channel__mastered">
              <span aria-hidden="true">🏆</span> Badge won
            </p>
          )}
        </div>
      </header>

      {isRefilling && <p className="channel__refill" role="status">Getting new videos for you…</p>}

      <section aria-labelledby="channel-videos-title">
        <h2 id="channel-videos-title" className="channel__section-title">Videos</h2>
        {videos.length === 0 ? (
          <p className="channel__why">No videos here yet. Check back soon!</p>
        ) : (
          <ul className="channel__grid">
            {videos.map(v => (
              <li key={v.id}>
                <VideoTile
                  video={v}
                  layout="grid"
                  onOpen={onOpen}
                  watched={watched.has(v.id)}
                  saved={j.saved.includes(v.id)}
                  onToggleSaved={j.toggleSaved}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
