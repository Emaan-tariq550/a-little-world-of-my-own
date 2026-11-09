import { useState } from 'react';
import { AnimatePresence, MotionConfig } from 'framer-motion';
import Intro from './components/Intro.jsx';
import StoryEngine from './components/StoryEngine.jsx';
import FilmGrain from './components/FilmGrain.jsx';
import BackgroundMusic from './components/BackgroundMusic.jsx';
import MusicControl from './components/MusicControl.jsx';
import { musicController } from './utils/musicController.js';
import { story } from './config/storyConfig.js';

export default function App() {
  const [started, setStarted] = useState(false);

  const handleStart = () => {
    // inside the click handler -> browsers allow audio playback
    musicController.start();
    setStarted(true);
  };

  return (
    <MotionConfig reducedMotion="user">
      <main className="relative h-[100dvh] w-full overflow-hidden bg-ink">
        {/* one persistent audio element: lives outside every AnimatePresence */}
        <BackgroundMusic config={story.music} />

        <AnimatePresence mode="wait">
          {!started ? (
            <Intro key="intro" copy={story.intro} onStart={handleStart} />
          ) : (
            <StoryEngine key="story" story={story} />
          )}
        </AnimatePresence>

        {started && <MusicControl labels={story.music.labels} />}
        <FilmGrain />
      </main>
    </MotionConfig>
  );
}