import { useMemo } from 'react';
import type { Channel } from '../types';
import { AGE_ORDER, CATALOG } from '../data/catalog';
import { useJourney } from '../state/journey-context';
import VideoTile from './VideoTile';
import './ChannelPage.css';

interface Props {
  channelId: string;
  onOpen(id: string): void;
}

function findChannel(channelId: string): { ch: Channel; category: string } | undefined {
  for (const age of AGE_ORDER) {
    for (const cat of CATALOG[age]) {
      const ch = cat.channels.find(c => c.channelId === channelId);
      if (ch) return { ch, category: cat.category };
    }
  }
  return undefined;
}

export default function ChannelPage({ channelId, onOpen }: Props) {
  const j = useJourney();
  const info = findChannel(channelId);
  const { channelVideos, watched } = j;

  const videos = useMemo(() => {
    const all = channelVideos(channelId);
    return [...all.filter(v => !watched.has(v.id)), ...all.filter(v => watched.has(v.id))];
  }, [channelVideos, channelId, watched]);

  const name = info?.ch.name ?? videos[0]?.channelName;
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
          {info?.ch.why && <p className="channel__why">{info.ch.why}</p>}
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
