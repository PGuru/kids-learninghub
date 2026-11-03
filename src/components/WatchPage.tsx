import { useEffect, useRef, useState } from 'react';
import type { FinishResult, Video } from '../types';
import { STARS_PER_VIDEO, useJourney } from '../state/journey-context';
import VideoTile from './VideoTile';
import FinishCelebration from './FinishCelebration';
import './WatchPage.css';

interface Props {
  videoId: string;
  onOpen(id: string): void;
  onOpenChannel(channelId: string): void;
  onBack(): void;
}

const UP_NEXT_MAX = 12;

/** Same-channel unwatched videos first, then the rest of the feed */
function buildUpNext(current: Video, sameChannel: Video[], feed: Video[], watched: Set<string>): Video[] {
  const seen = new Set([current.id]);
  const out: Video[] = [];
  const add = (v: Video) => { if (!seen.has(v.id) && out.length < UP_NEXT_MAX) { seen.add(v.id); out.push(v); } };
  sameChannel.filter(v => !watched.has(v.id)).forEach(add);
  feed.forEach(add);
  return out;
}

interface Celebration { result: FinishResult; origin?: DOMRect; next?: Video }

export default function WatchPage({ videoId, onOpen, onOpenChannel, onBack }: Props) {
  const j = useJourney();
  const video = j.getVideo(videoId);
  const finishRef = useRef<HTMLButtonElement>(null);
  const nudgeRef = useRef<HTMLButtonElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [celebration, setCelebration] = useState<Celebration | null>(null);
  const [nudge, setNudge] = useState<Video | null>(null);

  // A hidden channel's video can still be replayed from history, but nothing more from it is suggested
  const channelHidden = !!video && j.hiddenChannels.includes(video.channelId);
  const upNext = video
    ? buildUpNext(video, channelHidden ? [] : j.channelVideos(video.channelId), j.feed, j.watched)
    : [];

  useEffect(() => { if (nudge) nudgeRef.current?.focus(); }, [nudge]);

  if (!video) {
    return (
      <section className="watch watch--missing" aria-labelledby="watch-missing-title">
        <div className="watch__missing-card">
          <span className="watch__missing-icon" aria-hidden="true">🔍</span>
          <h1 id="watch-missing-title">We couldn't find that video</h1>
          <p>It may have moved. Let's find you something fun to watch.</p>
          <button type="button" className="btn btn--primary btn--lg" onClick={onBack}>Go home</button>
        </div>
      </section>
    );
  }

  const isWatched = j.watched.has(video.id);
  const isSaved = j.saved.includes(video.id);
  const title = video.title || `A video from ${video.channelName}`;
  const why = j.channelInfo(video.channelId)?.why;
  const progress = j.channelProgress(video.channelId);

  const finish = () => {
    if (isWatched) return;
    const origin = finishRef.current?.getBoundingClientRect();
    const next = upNext[0];
    const result = j.finishVideo(video.id);
    setNudge(null);
    setCelebration({ result, origin, next });
  };

  const closeCelebration = () => {
    const next = celebration?.next ?? null;
    setCelebration(null);
    if (next) setNudge(next);
    else titleRef.current?.focus();
  };

  return (
    <div className="watch">
      <div className="watch__main">
        <div className="watch__player">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(video.id)}?autoplay=1&rel=0&modestbranding=1`}
            title={title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>

        <h1 ref={titleRef} className="watch__title" tabIndex={-1}>{title}</h1>

        <div className="watch__channel">
          <span className="watch__avatar" aria-hidden="true">{video.channelName.charAt(0)}</span>
          <div className="watch__channel-text">
            <button
              type="button"
              className="watch__channel-name"
              onClick={() => onOpenChannel(video.channelId)}
            >
              {video.channelName}
            </button>
            {why && <p className="watch__why">{why}</p>}
            {progress.total > 0 && (
              <p className="watch__batch">
                {progress.watched} of {progress.total} watched in this batch
              </p>
            )}
          </div>
        </div>

        <div className="watch__actions">
          <button
            ref={finishRef}
            type="button"
            className={`btn btn--lg watch__finish ${isWatched ? 'watch__finish--done' : 'btn--primary'}`}
            onClick={finish}
            disabled={isWatched}
            aria-label={isWatched ? 'Watched' : `I watched it! Earn ${STARS_PER_VIDEO} stars`}
          >
            {isWatched ? 'Watched ✓' : <>I watched it! +{STARS_PER_VIDEO} <span aria-hidden="true">⭐</span></>}
          </button>
          <button
            type="button"
            className="btn"
            aria-pressed={isSaved}
            onClick={() => j.toggleSaved(video.id)}
          >
            <span aria-hidden="true">{isSaved ? '✓' : '🕒'}</span>
            {isSaved ? 'Saved for later' : 'Watch later'}
          </button>
          <button type="button" className="btn btn--ghost" onClick={onBack}>Back</button>
        </div>

        {nudge && (
          <div className="watch__nudge" role="region" aria-label="Next video">
            <img className="watch__nudge-thumb" src={nudge.thumb} alt="" />
            <div className="watch__nudge-text">
              <p className="watch__nudge-head">Ready for another?</p>
              <p className="watch__nudge-title">{nudge.title || `A video from ${nudge.channelName}`}</p>
            </div>
            <button ref={nudgeRef} type="button" className="btn btn--primary" onClick={() => onOpen(nudge.id)}>
              Play next video
            </button>
          </div>
        )}
      </div>

      <aside className="watch__upnext" aria-labelledby="watch-upnext-title">
        <h2 id="watch-upnext-title" className="watch__upnext-title">Up next</h2>
        {upNext.length === 0 ? (
          <p className="watch__upnext-empty">You've watched everything here. Amazing! New videos are on the way.</p>
        ) : (
          <ul className="watch__upnext-list">
            {upNext.map(v => (
              <li key={v.id}>
                <VideoTile
                  video={v}
                  layout="row"
                  onOpen={onOpen}
                  onOpenChannel={onOpenChannel}
                  watched={j.watched.has(v.id)}
                  saved={j.saved.includes(v.id)}
                  onToggleSaved={j.toggleSaved}
                />
              </li>
            ))}
          </ul>
        )}
      </aside>

      {celebration && (
        <FinishCelebration
          result={celebration.result}
          origin={celebration.origin}
          nextVideo={celebration.next}
          onNext={() => { if (celebration.next) onOpen(celebration.next.id); }}
          onClose={closeCelebration}
        />
      )}
    </div>
  );
}
