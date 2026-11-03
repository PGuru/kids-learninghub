import { useState } from 'react';
import type { Video } from '../types';
import { CAT_ICONS } from '../data/catalog';
import { STARS_PER_VIDEO } from '../state/journey-context';
import './VideoTile.css';

interface Props {
  video: Video;
  onOpen(id: string): void;
  onOpenChannel?(channelId: string): void;
  layout?: 'grid' | 'row';
  watched?: boolean;
  saved?: boolean;
  onToggleSaved?(id: string): void;
}

const videoTitle = (v: Video) => v.title ?? `A video from ${v.channelName}`;

export default function VideoTile({
  video, onOpen, onOpenChannel, layout = 'grid', watched = false, saved = false, onToggleSaved,
}: Props) {
  const title = videoTitle(video);
  const icon = CAT_ICONS[video.category];
  const initial = video.channelName.trim().charAt(0).toUpperCase() || '?';
  // Deleted/private videos get YouTube's 120x90 grey placeholder thumbnail — hide those tiles
  const [unavailable, setUnavailable] = useState(false);
  if (unavailable) return null;

  return (
    <article className={`vtile vtile--${layout}${watched ? ' vtile--watched' : ''}`}>
      <button
        type="button"
        className="vtile__thumb"
        onClick={() => onOpen(video.id)}
        aria-label={`Play ${title}${watched ? ', watched' : `, earn ${STARS_PER_VIDEO} stars`}`}
      >
        <img src={video.thumb} alt="" loading="lazy" decoding="async"
          onLoad={e => { if (e.currentTarget.naturalWidth === 120) setUnavailable(true); }} />
        {watched ? (
          <span className="vtile__badge vtile__badge--watched" aria-hidden="true">✓ Watched</span>
        ) : (
          <span className="vtile__badge vtile__badge--stars" aria-hidden="true">+{STARS_PER_VIDEO} ⭐</span>
        )}
      </button>

      {onToggleSaved && (
        <button
          type="button"
          className={`vtile__save${saved ? ' vtile__save--on' : ''}`}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${title} from watch later` : `Save ${title} to watch later`}
          title={saved ? 'Saved to watch later' : 'Watch later'}
          onClick={() => onToggleSaved(video.id)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M6.5 3.5h11a1 1 0 0 1 1 1v16l-6.5-4.5-6.5 4.5v-16a1 1 0 0 1 1-1z"
              fill={saved ? 'currentColor' : 'none'}
              stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"
            />
          </svg>
        </button>
      )}

      <div className="vtile__info">
        {layout === 'grid' && (
          <span className="vtile__avatar" aria-hidden="true">{initial}</span>
        )}
        <div className="vtile__text">
          <h3 className="vtile__title">
            <button type="button" className="vtile__title-btn" onClick={() => onOpen(video.id)} tabIndex={-1}>
              {title}
            </button>
          </h3>
          {onOpenChannel ? (
            <button type="button" className="vtile__channel" onClick={() => onOpenChannel(video.channelId)}>
              {video.channelName}
            </button>
          ) : (
            <span className="vtile__channel vtile__channel--static">{video.channelName}</span>
          )}
          <span className="vtile__cat">
            {icon && <span aria-hidden="true">{icon}</span>}
            {video.category}
          </span>
        </div>
      </div>
    </article>
  );
}
