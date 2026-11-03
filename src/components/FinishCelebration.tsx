import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import type { FinishResult, Video } from '../types';
import { STREAK_BONUS } from '../state/journey-context';
import './FinishCelebration.css';

interface Props {
  result: FinishResult;
  nextVideo?: Video;
  /** Rect of the element the stars burst from (usually the finish button) */
  origin?: DOMRect;
  onNext(): void;
  onClose(): void;
}

type Phase = 'flight' | 'card';
interface Point { x: number; y: number }

const STAR_COUNT   = 7;
const FLIGHT_MS    = 1000;
const STAGGER_MS   = 55;
const COUNT_UP_MS  = 600;
const SAFETY_MS    = 2400; // show the card even if animations never report finished

const STAR_SVG =
  '<svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true">' +
  '<path d="M12 2.2l2.95 6.2 6.8.83-5 4.7 1.28 6.73L12 17.4l-6.03 3.26 1.28-6.73-5-4.7 6.8-.83z" ' +
  'fill="#FFC83A" stroke="#1D1F45" stroke-width="1.8" stroke-linejoin="round"/></svg>';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function centerOf(r: DOMRect): Point { return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }

function jarTarget(): Point {
  const jar = document.getElementById('star-jar');
  if (jar) {
    const r = jar.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) return centerOf(r);
  }
  return { x: window.innerWidth - 56, y: 32 };
}

function bumpJar() {
  const jar = document.getElementById('star-jar');
  if (!jar) return;
  jar.classList.remove('star-jar--bump');
  void jar.offsetWidth; // restart the keyframes
  jar.classList.add('star-jar--bump');
}

function clearJarBump() {
  document.getElementById('star-jar')?.classList.remove('star-jar--bump');
}

const quad = (a: number, c: number, b: number, t: number) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * c + t * t * b;
const rand = (min: number, max: number) => min + Math.random() * (max - min);

/** Burst stars out of `origin` and fly them on curved paths into the star jar. */
function launchStars(origin: DOMRect | undefined, count: number, onLand: () => void) {
  const nodes: HTMLElement[] = [];
  const anims: Animation[] = [];
  const O: Point = origin ? centerOf(origin) : { x: window.innerWidth / 2, y: window.innerHeight * 0.6 };
  const T = jarTarget();

  if (typeof document.body.animate !== 'function') {
    return { done: Promise.resolve(), cancel() {} };
  }

  const promises: Promise<void>[] = [];
  for (let i = 0; i < count; i++) {
    const node = document.createElement('span');
    node.className = 'fc-star';
    node.innerHTML = STAR_SVG;
    document.body.appendChild(node);
    nodes.push(node);

    // Upward fan between -165deg and -15deg, with jitter
    const angle = (-165 + (150 * i) / Math.max(1, count - 1) + rand(-10, 10)) * (Math.PI / 180);
    const radius = rand(70, 130);
    const B: Point = { x: O.x + Math.cos(angle) * radius, y: O.y + Math.sin(angle) * radius };
    const tgt: Point = { x: T.x + rand(-6, 6), y: T.y + rand(-4, 4) };
    // Control point inside the B..T box: some stars go up-then-across, others across-then-up
    const k = rand(0.15, 0.85);
    const C: Point = { x: B.x + (tgt.x - B.x) * k + rand(-40, 40), y: B.y + (tgt.y - B.y) * (1 - k) };
    const spin = (i % 2 ? 1 : -1) * rand(200, 380);
    const size = rand(26, 38);
    node.style.width = node.style.height = `${size}px`;

    const tf = (p: Point, s: number, r: number) =>
      `translate(${p.x}px, ${p.y}px) translate(-50%, -50%) scale(${s}) rotate(${r}deg)`;

    const frames: Keyframe[] = [
      { offset: 0, transform: tf(O, 0.2, 0), opacity: 0, easing: 'cubic-bezier(.2,.9,.3,1.2)' },
      { offset: 0.05, opacity: 1 },
      { offset: 0.24, transform: tf(B, 1.35, spin * 0.15), opacity: 1 },
    ];
    const steps = 10;
    for (let s = 1; s <= steps; s++) {
      const lin = s / steps;
      const t = Math.pow(lin, 1.5); // accelerate into the jar
      const p = { x: quad(B.x, C.x, tgt.x, t), y: quad(B.y, C.y, tgt.y, t) };
      frames.push({
        offset: 0.24 + 0.76 * lin,
        transform: tf(p, 1.35 - 0.95 * lin, spin * (0.15 + 0.85 * lin)),
        opacity: s === steps ? 0.85 : 1,
      });
    }

    const anim = node.animate(frames, { duration: FLIGHT_MS, delay: i * STAGGER_MS, fill: 'both' });
    anims.push(anim);
    promises.push(anim.finished.then(() => { node.remove(); onLand(); }, () => { node.remove(); }));
  }

  return {
    done: Promise.all(promises).then(() => undefined),
    cancel() { anims.forEach(a => a.cancel()); nodes.forEach(n => n.remove()); },
  };
}

export default function FinishCelebration({ result, nextVideo, origin, onNext, onClose }: Props) {
  const [reduced] = useState(prefersReducedMotion);
  const skip = result.starsEarned <= 0;
  const [phase, setPhase] = useState<Phase>(reduced ? 'card' : 'flight');
  const [shown, setShown] = useState(reduced ? result.starsEarned : 0);
  const [announce, setAnnounce] = useState('');
  const cardRef = useRef<HTMLDivElement>(null);
  const primaryRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; });

  // Rewatch: nothing to celebrate
  useEffect(() => { if (skip) closeRef.current(); }, [skip]);

  // Star flight
  useEffect(() => {
    if (skip || phase !== 'flight') return;
    let alive = true;
    const toCard = () => { if (alive) setPhase('card'); };
    const flight = launchStars(origin, STAR_COUNT, bumpJar);
    let t = 0;
    flight.done.then(() => { t = window.setTimeout(toCard, 120); });
    const safety = window.setTimeout(toCard, SAFETY_MS);
    return () => { alive = false; flight.cancel(); clearTimeout(t); clearTimeout(safety); };
  }, [skip, phase, origin]);

  // Card: focus, announce, count up
  useEffect(() => {
    if (skip || phase !== 'card') return;
    primaryRef.current?.focus();
    const msg = [
      `You earned ${result.starsEarned} stars!`,
      result.streakExtended ? `${result.streak} day streak.` : '',
      result.levelUp ? `Level up! You're now level ${result.levelUp}.` : '',
      result.channelMastered ? `You finished every video from ${result.channelMastered} in this batch.` : '',
    ].filter(Boolean).join(' ');
    const a = window.setTimeout(() => setAnnounce(msg), 60);

    let raf = 0;
    if (!reduced) {
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / COUNT_UP_MS);
        setShown(Math.round(result.starsEarned * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }
    return () => { clearTimeout(a); cancelAnimationFrame(raf); };
  }, [skip, phase, result, reduced]);

  // Escape closes at any point
  useEffect(() => {
    if (skip) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.preventDefault(); closeRef.current(); } };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [skip]);

  // Leave the jar clean
  useEffect(() => {
    const jar = document.getElementById('star-jar');
    const off = () => jar?.classList.remove('star-jar--bump');
    jar?.addEventListener('animationend', off);
    return () => { jar?.removeEventListener('animationend', off); clearJarBump(); };
  }, []);

  if (skip) return null;

  // Keep Tab inside the dialog
  const trapTab = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab' || !cardRef.current) return;
    const items = [...cardRef.current.querySelectorAll<HTMLElement>('button:not([disabled])')];
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  const bonus = result.streakExtended ? STREAK_BONUS : 0;
  const wins: { kind: string; icon: string; text: string }[] = [];
  if (result.streakExtended) wins.push({ kind: 'streak', icon: '🔥', text: `${result.streak} day streak!` });
  if (result.levelUp) wins.push({ kind: 'level', icon: '🚀', text: `Level up! You're now level ${result.levelUp}` });
  if (result.channelMastered) wins.push({ kind: 'mastered', icon: '🏆', text: `You finished every video from ${result.channelMastered} in this batch!` });

  return (
    <>
      <p className="visually-hidden" role="status" aria-live="polite">{announce}</p>
      {phase === 'card' && (
        <div className="fc__backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
          <div
            ref={cardRef}
            className="fc__card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="fc-title"
            aria-describedby="fc-desc"
            onKeyDown={trapTab}
          >
            <div className="fc__burst" aria-hidden="true">
              {[0, 1, 2, 3, 4].map(i => (
                <span key={i} className="fc__spark" style={{ '--i': i } as CSSProperties} dangerouslySetInnerHTML={{ __html: STAR_SVG }} />
              ))}
            </div>

            <h2 id="fc-title" className="fc__stars" aria-label={`+${result.starsEarned} stars`}>
              +{shown} <span className="fc__stars-word">stars</span>
            </h2>
            <p id="fc-desc" className="fc__total">
              {bonus > 0
                ? `That's ${result.starsEarned - bonus} for watching and ${bonus} bonus stars for today. You have ${result.totalStars} stars now.`
                : `You have ${result.totalStars} stars now.`}
            </p>

            {wins.length > 0 && (
              <ul className="fc__wins">
                {wins.map((w, i) => (
                  <li key={w.kind} className={`fc__win fc__win--${w.kind}`} style={{ '--i': i } as CSSProperties}>
                    <span className="fc__win-icon" aria-hidden="true">{w.icon}</span>
                    <span>{w.text}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="fc__actions">
              {nextVideo && (
                <button ref={primaryRef} type="button" className="btn btn--primary btn--lg fc__next" onClick={onNext}>
                  Next video
                </button>
              )}
              <button
                ref={nextVideo ? undefined : primaryRef}
                type="button"
                className={`btn btn--lg ${nextVideo ? '' : 'btn--primary'}`}
                onClick={onClose}
              >
                Back to videos
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
