import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import type { AgeId } from '../types';
import { AGE_GROUPS, AGE_ORDER, ageGroup } from '../data/catalog';
import { channelIdsOf } from '../data/effective';
import { useJourney } from '../state/journey-context';
import PinPad from './PinPad';
import ChannelManager from './ChannelManager';
import './ParentGate.css';

export type ParentGateMode = { kind: 'settings' } | { kind: 'unlock'; age: AgeId };

interface Props {
  mode: ParentGateMode;
  onClose: () => void;
}

type Step = 'pin' | 'settings' | 'channels' | 'new-pin' | 'confirm-pin';

// Steps that show the wide grown-up panel (close button, Escape closes/goes back)
const isPanelStep = (s: Step) => s === 'settings' || s === 'channels';

const DEFAULT_PIN = '1234';
const spokenRange = (id: AgeId) => `ages ${id.replace('-', ' to ')}`;

// Raising the age limit can trigger a one-off video download, during which App
// swaps the whole shell for the loading screen and this dialog unmounts. This
// flag lets the settings panel come straight back afterwards without asking
// for the PIN a second time. Cleared whenever the dialog is closed.
let resumeSettings = false;
const setResume = (v: boolean) => { resumeSettings = v; };

const FOCUSABLE = 'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [href], [tabindex]:not([tabindex="-1"])';

export default function ParentGate({ mode, onClose }: Props) {
  const j = useJourney();
  const [step, setStep] = useState<Step>(() =>
    mode.kind === 'settings' && resumeSettings ? 'settings' : 'pin');
  const [newPin, setNewPin] = useState('');
  const [pinChanged, setPinChanged] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const manageBtnRef = useRef<HTMLButtonElement>(null);
  const fromChannels = useRef(false); // back from the channel manager: refocus its button
  const settingsTitleId = useId();
  const channelsTitleId = useId();
  const ageHelpId = useId();

  // Distinct channels on the hub across every age group
  const { ageCategories } = j;
  const channelCount = useMemo(
    () => new Set(AGE_ORDER.flatMap(a => channelIdsOf(ageCategories(a)))).size,
    [ageCategories],
  );

  const close = () => { setResume(false); onClose(); };
  const closeRef = useRef(close);
  useEffect(() => { closeRef.current = close; });

  // Remember what had focus, lock page scroll, restore both on close
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
      prev?.focus?.();
    };
  }, []);

  // Move focus into the settings panel when it appears (PinPad focuses itself)
  // (ChannelManager focuses its own heading)
  useEffect(() => {
    if (step !== 'settings') return;
    if (fromChannels.current) { fromChannels.current = false; manageBtnRef.current?.focus(); }
    else headingRef.current?.focus();
  }, [step]);

  // Escape on the settings panel closes, on the channel manager goes back; Tab stays inside the dialog
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && step === 'settings') { e.preventDefault(); closeRef.current(); return; }
      if (e.key === 'Escape' && step === 'channels') {
        // Let an open <select> handle its own Escape
        if (e.target instanceof HTMLSelectElement) return;
        e.preventDefault(); fromChannels.current = true; setStep('settings'); return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;
      const items = [...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !panelRef.current.contains(active))) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step]);

  // ------------------------------------------------------------- PIN steps
  const checkPin = (entered: string) => {
    if (entered !== j.pin) return false;
    if (mode.kind === 'unlock') {
      void j.unlockAge(mode.age);
      close();
    } else {
      setStep('settings');
    }
    return true;
  };

  const chooseNewPin = (entered: string) => {
    setNewPin(entered);
    setStep('confirm-pin');
    return true;
  };

  const confirmNewPin = (entered: string) => {
    if (entered !== newPin) return false;
    j.setPin(entered);
    setNewPin('');
    setPinChanged(true);
    setStep('settings');
    return true;
  };

  const pickLimit = (id: AgeId) => {
    if (id === j.maxAge) return;
    setResume(true);
    j.setMaxAge(id);
  };

  const startOver = () => {
    j.resetToOnboarding();
    close();
  };

  // ------------------------------------------------------------- render
  let body: ReactNode;
  let label: string;

  if (step === 'pin') {
    if (mode.kind === 'unlock') {
      const g = ageGroup(mode.age);
      label = `Unlock ${g.label}`;
      body = (
        <PinPad
          key="check"
          title={label}
          subtitle={`A grown-up needs to enter the PIN for ${spokenRange(mode.age)}`}
          onSubmit={checkPin}
          onCancel={close}
        />
      );
    } else {
      label = 'Grown-ups only';
      body = (
        <PinPad
          key="check"
          title={label}
          subtitle="Enter the PIN to open the settings."
          onSubmit={checkPin}
          onCancel={close}
        />
      );
    }
  } else if (step === 'new-pin') {
    label = 'Choose a new PIN';
    body = (
      <PinPad
        key="new"
        title={label}
        subtitle="Pick 4 numbers your child won't guess."
        onSubmit={chooseNewPin}
        onCancel={() => setStep('settings')}
      />
    );
  } else if (step === 'confirm-pin') {
    label = 'Enter it again';
    body = (
      <PinPad
        key="confirm"
        title={label}
        subtitle="Type the same 4 numbers to confirm."
        onSubmit={confirmNewPin}
        onCancel={() => { setNewPin(''); setStep('settings'); }}
      />
    );
  } else if (step === 'channels') {
    label = 'Channels';
    body = (
      <ChannelManager
        titleId={channelsTitleId}
        onBack={() => { fromChannels.current = true; setStep('settings'); }}
      />
    );
  } else {
    label = 'Grown-ups';
    body = (
      <div className="pgate__settings">
        <header className="pgate__head">
          <h2 className="pgate__title" id={settingsTitleId} ref={headingRef} tabIndex={-1}>Grown-ups</h2>
          <p className="pgate__lede">Settings for this device.</p>
        </header>

        <section className="pgate__section" aria-labelledby={`${settingsTitleId}-age`}>
          <h3 className="pgate__h3" id={`${settingsTitleId}-age`}>Age limit</h3>
          <p className="pgate__help" id={ageHelpId}>
            Your child can browse this age and younger. Older groups need the PIN.
          </p>
          <div className="pgate__ages" role="radiogroup" aria-labelledby={`${settingsTitleId}-age`} aria-describedby={ageHelpId}>
            {AGE_GROUPS.map(g => (
              <label
                key={g.id}
                className="pgate__age"
                style={{ '--opt-light': g.light } as CSSProperties}
              >
                <input
                  type="radio"
                  name="pgate-age-limit"
                  className="pgate__radio"
                  value={g.id}
                  checked={j.maxAge === g.id}
                  onChange={() => pickLimit(g.id)}
                />
                <span className="pgate__age-emoji" aria-hidden="true">{g.emoji}</span>
                <span className="pgate__age-text">
                  <span className="pgate__age-range">{g.range}</span>
                  <span className="pgate__age-label">{g.label}</span>
                </span>
              </label>
            ))}
          </div>
        </section>

        <section className="pgate__section" aria-labelledby={`${settingsTitleId}-channels`}>
          <h3 className="pgate__h3" id={`${settingsTitleId}-channels`}>Channels</h3>
          <p className="pgate__help">
            Add a YouTube channel you trust, or hide ones that aren't right for your child.
          </p>
          <button
            ref={manageBtnRef}
            type="button"
            className="btn"
            onClick={() => setStep('channels')}
          >
            Manage channels ({channelCount})
          </button>
        </section>

        <section className="pgate__section" aria-labelledby={`${settingsTitleId}-pin`}>
          <h3 className="pgate__h3" id={`${settingsTitleId}-pin`}>PIN</h3>
          {j.pin === DEFAULT_PIN && !pinChanged && (
            <p className="pgate__warn">
              You're still using the starting PIN, 1234. Change it so your child can't unlock older videos.
            </p>
          )}
          <p className="pgate__ok" role="status">{pinChanged ? '✓ PIN changed' : ''}</p>
          <button
            type="button"
            className="btn"
            onClick={() => { setPinChanged(false); setStep('new-pin'); }}
          >
            Change PIN
          </button>
        </section>

        <section className="pgate__section" aria-labelledby={`${settingsTitleId}-progress`}>
          <h3 className="pgate__h3" id={`${settingsTitleId}-progress`}>Progress so far</h3>
          <dl className="pgate__stats">
            <div className="pgate__stat"><dt>Stars</dt><dd>{j.stars}</dd></div>
            <div className="pgate__stat"><dt>Videos watched</dt><dd>{j.watched.size}</dd></div>
            <div className="pgate__stat">
              <dt>Day streak</dt>
              <dd>{j.streak} {j.streak === 1 ? 'day' : 'days'}</dd>
            </div>
            <div className="pgate__stat"><dt>Channels finished</dt><dd>{j.mastered.length}</dd></div>
          </dl>
          <p className="pgate__fine">Progress is saved on this device only.</p>
        </section>

        <section className="pgate__section" aria-labelledby={`${settingsTitleId}-reset`}>
          <h3 className="pgate__h3" id={`${settingsTitleId}-reset`}>Start over</h3>
          <p className="pgate__help">
            Go back to the age picker. Stars and watch history are kept.
          </p>
          <button type="button" className="btn" onClick={startOver}>
            Start over with age selection
          </button>
        </section>

        <div className="pgate__foot">
          <button type="button" className="btn btn--primary btn--lg" onClick={close}>
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="pgate"
      // Not while managing channels — a stray click would throw away a half-filled form
      onMouseDown={e => { if (e.target === e.currentTarget && step !== 'channels') close(); }}
    >
      <div
        ref={panelRef}
        className={`pgate__panel${isPanelStep(step) ? ' pgate__panel--wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={isPanelStep(step) ? undefined : label}
        aria-labelledby={step === 'settings' ? settingsTitleId : step === 'channels' ? channelsTitleId : undefined}
      >
        {isPanelStep(step) && (
          <button
            type="button"
            className="btn btn--ghost btn--icon pgate__x"
            onClick={close}
            aria-label="Close settings"
          >
            ✕
          </button>
        )}
        {body}
      </div>
    </div>
  );
}
