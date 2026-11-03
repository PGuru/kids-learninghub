import { useEffect, useId, useRef, useState } from 'react';
import './PinPad.css';

interface Props {
  title: string;
  subtitle?: string;
  /** Return true if the PIN was accepted. */
  onSubmit: (pin: string) => boolean;
  onCancel: () => void;
}

const PIN_LENGTH = 4;
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back'] as const;

export default function PinPad({ title, subtitle, onSubmit, onCancel }: Props) {
  const [digits, setDigits] = useState('');
  const [error, setError]   = useState(false);
  const [shake, setShake]   = useState(false);
  const digitsRef = useRef('');
  const busyRef   = useRef(false); // true between the 4th digit and the verdict
  const titleId   = useId();
  const firstKey  = useRef<HTMLButtonElement>(null);

  // Latest callbacks, so the keyboard listener never goes stale
  const submitRef = useRef(onSubmit);
  const cancelRef = useRef(onCancel);
  useEffect(() => { submitRef.current = onSubmit; cancelRef.current = onCancel; });

  const update = (next: string) => { digitsRef.current = next; setDigits(next); };

  const pressRef = useRef((d: string) => {
    if (busyRef.current || digitsRef.current.length >= PIN_LENGTH) return;
    const next = digitsRef.current + d;
    update(next);
    setError(false);
    if (next.length === PIN_LENGTH) {
      busyRef.current = true;
      // A short beat so the fourth dot is visibly filled before the verdict
      window.setTimeout(() => {
        const ok = submitRef.current(next);
        busyRef.current = false;
        if (!ok) {
          update('');
          setError(true);
          setShake(true);
        }
      }, 140);
    }
  });

  const backRef = useRef(() => {
    if (busyRef.current) return;
    update(digitsRef.current.slice(0, -1));
  });

  useEffect(() => { firstKey.current?.focus(); }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (/^[0-9]$/.test(e.key)) { e.preventDefault(); pressRef.current(e.key); }
      else if (e.key === 'Backspace' || e.key === 'Delete') { e.preventDefault(); backRef.current(); }
      else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); cancelRef.current(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="pinpad" role="group" aria-labelledby={titleId}>
      <h2 className="pinpad__title" id={titleId}>{title}</h2>
      {subtitle && <p className="pinpad__subtitle">{subtitle}</p>}

      <div
        className={`pinpad__dots${shake ? ' pinpad__dots--shake' : ''}`}
        onAnimationEnd={() => setShake(false)}
        aria-hidden="true"
      >
        {Array.from({ length: PIN_LENGTH }, (_, i) => (
          <span key={i} className={`pinpad__dot${i < digits.length ? ' pinpad__dot--on' : ''}`} />
        ))}
      </div>
      <p className="visually-hidden" aria-live="polite">
        {digits.length} of {PIN_LENGTH} digits entered
      </p>

      <p className="pinpad__error" role="alert">
        {error ? "That PIN didn't match. Try again." : ''}
      </p>

      <div className="pinpad__keys">
        {KEYS.map((k, i) => {
          if (k === '') return <span key={i} className="pinpad__spacer" aria-hidden="true" />;
          if (k === 'back') {
            return (
              <button
                key={i} type="button" className="pinpad__key pinpad__key--back"
                onClick={() => backRef.current()} aria-label="Delete last digit"
              >
                ⌫
              </button>
            );
          }
          return (
            <button
              key={i} type="button" className="pinpad__key"
              ref={k === '1' ? firstKey : undefined}
              onClick={() => pressRef.current(k)}
            >
              {k}
            </button>
          );
        })}
      </div>

      <button type="button" className="btn btn--ghost pinpad__cancel" onClick={onCancel}>
        Cancel
      </button>
    </div>
  );
}
