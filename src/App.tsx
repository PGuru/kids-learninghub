import { useEffect, useState } from 'react';
import type { AgeId, View } from './types';
import { ageGroup, ageIndex } from './data/catalog';
import { JourneyProvider } from './state/JourneyProvider';
import { useJourney } from './state/journey-context';
import TopBar from './components/TopBar';
import SideRail from './components/SideRail';
import HomeFeed from './components/HomeFeed';
import ListPage from './components/ListPage';
import WatchPage from './components/WatchPage';
import TrophiesPage from './components/TrophiesPage';
import ChannelPage from './components/ChannelPage';
import Onboarding from './components/Onboarding';
import LoadingScreen from './components/LoadingScreen';
import ParentGate, { type ParentGateMode } from './components/ParentGate';
import './App.css';

function Shell() {
  const j = useJourney();
  const [view, setView]       = useState<View>({ name: 'home' });
  const [query, setQuery]     = useState('');
  const [railOpen, setRail]   = useState(false); // mobile drawer
  const [gate, setGate]       = useState<ParentGateMode | null>(null);

  // Age accent drives --age / --age-light everywhere
  useEffect(() => {
    if (!j.viewingAge) return;
    const g = ageGroup(j.viewingAge);
    document.documentElement.style.setProperty('--age', g.accent);
    document.documentElement.style.setProperty('--age-light', g.light);
  }, [j.viewingAge]);

  // Scroll to top on page change
  useEffect(() => { window.scrollTo({ top: 0 }); }, [view]);

  if (!j.maxAge || !j.viewingAge) return <Onboarding />;
  if (j.loadingAge) return <LoadingScreen />;

  const navigate = (v: View) => { setView(v); setRail(false); };
  const openVideo = (videoId: string) => navigate({ name: 'watch', videoId });
  const openChannel = (channelId: string) => navigate({ name: 'channel', channelId });

  const pickAge = (id: AgeId) => {
    if (ageIndex(id) > ageIndex(j.maxAge!)) setGate({ kind: 'unlock', age: id });
    else { j.browseAge(id); navigate({ name: 'home' }); }
  };

  return (
    <div className="app">
      <TopBar
        query={query}
        onSearch={q => { setQuery(q); if (view.name !== 'home') navigate({ name: 'home' }); }}
        onMenu={() => setRail(o => !o)}
        onHome={() => { setQuery(''); navigate({ name: 'home' }); }}
        onOpenTrophies={() => navigate({ name: 'trophies' })}
        onOpenParent={() => setGate({ kind: 'settings' })}
      />
      <div className="app__body">
        <SideRail
          open={railOpen}
          view={view}
          onNavigate={navigate}
          onPickAge={pickAge}
          onClose={() => setRail(false)}
        />
        <main className="app__main" id="main">
          {view.name === 'home'     && <HomeFeed query={query} onClearSearch={() => setQuery('')} onOpen={openVideo} onOpenChannel={openChannel} />}
          {view.name === 'history'  && <ListPage kind="history" onOpen={openVideo} onOpenChannel={openChannel} />}
          {view.name === 'saved'    && <ListPage kind="saved"   onOpen={openVideo} onOpenChannel={openChannel} />}
          {view.name === 'trophies' && <TrophiesPage onOpenChannel={openChannel} />}
          {view.name === 'channel'  && <ChannelPage channelId={view.channelId} onOpen={openVideo} />}
          {view.name === 'watch'    && (
            <WatchPage
              key={view.videoId}
              videoId={view.videoId}
              onOpen={openVideo}
              onOpenChannel={openChannel}
              onBack={() => navigate({ name: 'home' })}
            />
          )}
        </main>
      </div>
      {gate && <ParentGate mode={gate} onClose={() => setGate(null)} />}
    </div>
  );
}

export default function App() {
  return (
    <JourneyProvider>
      <Shell />
    </JourneyProvider>
  );
}
