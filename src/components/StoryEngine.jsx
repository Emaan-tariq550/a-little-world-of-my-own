import { useCallback, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Chapter from './Chapter.jsx';
import FinalScene from './FinalScene.jsx';
import ProgressIndicator from './ProgressIndicator.jsx';
import { musicController } from '../utils/musicController.js';

export default function StoryEngine({ story, onReplay }) {
  const { chapters, ending, timing, kenBurns, music } = story;
  const [chapterIndex, setChapterIndex] = useState(0);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [phase, setPhase] = useState('story'); // story | ending

  const { starts, total } = useMemo(() => {
    let sum = 0;
    const s = chapters.map((c) => {
      const start = sum;
      sum += c.scenes.length;
      return start;
    });
    return { starts: s, total: sum };
  }, [chapters]);

  const chapter = chapters[chapterIndex];

  const handleChapterComplete = useCallback(() => {
    if (chapterIndex < chapters.length - 1) {
      // chapter change: music is NOT touched, it just keeps playing
      setSceneIndex(0);
      setChapterIndex((i) => i + 1);
    } else {
      // story is over: the soundtrack fades out together with the picture
      musicController.fadeOutAndStop(music.endFadeMs);
      setPhase('ending');
    }
  }, [chapterIndex, chapters.length, music.endFadeMs]);

  const handleReplay = useCallback(() => {
    musicController.restart(); // runs inside the click -> autoplay-safe
    setChapterIndex(0);
    setSceneIndex(0);
    setPhase('story');
    onReplay?.();
  }, [onReplay]);

  const progress =
    phase === 'ending' ? 1 : (starts[chapterIndex] + sceneIndex + 1) / total;

  return (
    <motion.div
      className="absolute inset-0 overflow-hidden bg-ink"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <AnimatePresence mode="wait">
        {phase === 'story' ? (
          <Chapter
            key={chapter.id}
            chapter={chapter}
            presets={kenBurns}
            timing={timing}
            onSceneChange={setSceneIndex}
            onComplete={handleChapterComplete}
          />
        ) : (
          <FinalScene key="final" ending={ending} onReplay={handleReplay} />
        )}
      </AnimatePresence>

      <ProgressIndicator
        progress={progress}
        chapter={chapter}
        totalChapters={chapters.length}
        hidden={phase === 'ending'}
      />
    </motion.div>
  );
}