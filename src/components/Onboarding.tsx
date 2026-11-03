import { useState, type CSSProperties } from 'react';
import type { AgeId } from '../types';
import { AGE_GROUPS } from '../data/catalog';
import { YT_KEY } from '../lib/youtube';
import { useJourney } from '../state/journey-context';
import LoadingScreen from './LoadingScreen';
import './Onboarding.css';

const spokenRange = (id: AgeId) => id.replace('-', ' to ');

export default function Onboarding() {
  const j = useJourney();
  const [picked, setPicked] = useState<AgeId | null>(null);

  if (j.loadingAge) return <LoadingScreen />;

  const choose = (id: AgeId) => {
    if (picked) return;
    setPicked(id);
    // Release the lock if the choice fails, so the child can try again
    j.chooseAge(id).catch(() => setPicked(null));
  };

  return (
    <div className="onboard">
      <header className="onboard__brand">
        <span className="onboard__logo" aria-hidden="true">🧭</span>
        <span className="onboard__wordmark">Knowledge Journey</span>
      </header>

      <main className="onboard__main">
        <h1 className="onboard__title">How old are you?</h1>
        <p className="onboard__lede">Tap your age to find videos made for you.</p>

        <ul className="onboard__grid">
          {AGE_GROUPS.map(g => (
            <li key={g.id}>
              <button
                type="button"
                className="onboard__card"
                style={{ '--card-light': g.light, '--card-accent': g.accent } as CSSProperties}
                onClick={() => choose(g.id)}
                disabled={picked !== null && picked !== g.id}
                aria-label={`${spokenRange(g.id)}, ${g.label}`}
              >
                <span className="onboard__emoji" aria-hidden="true">{g.emoji}</span>
                <span className="onboard__range">{spokenRange(g.id)}</span>
                <span className="onboard__label">{g.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </main>

      <footer className="onboard__grownups">
        <p>
          <strong>For grown-ups:</strong> you can change this later behind the 🔒 button.
          The starting PIN is 1234, so please change it in the grown-ups settings.
        </p>
        {!YT_KEY && (
          <p className="onboard__quiet">
            Sample videos are shown until a YouTube API key is added
            (set <code>VITE_YOUTUBE_API_KEY</code> in <code>.env.local</code>).
          </p>
        )}
      </footer>
    </div>
  );
}
