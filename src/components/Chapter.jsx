import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Slideshow from './Slideshow.jsx';
import LightLeak from './LightLeak.jsx';
import TextReveal from './TextReveal.jsx';
import { preloadScene } from '../utils/media.js';

const ease = [0.22, 0.61, 0.36, 1];

function TitleCard({ chapter }) {
  const { palette } = chapter;
  return (
    <motion.div
      className="absolute inset-0 z-20 flex flex-col items-center justify-center px-8 text-center"
      style={{ background: palette.bg }}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1.6, ease: 'easeInOut' } }}
    >
      <motion.p
        className="font-sans text-[0.65rem] font-light uppercase tracking-[0.6em]"
        style={{ color: palette.accent }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.6, delay: 0.4 }}
      >
        {chapter.number}
      </motion.p>

      <motion.span
        aria-hidden
        className="my-5 block h-px w-12 origin-center"
        style={{ background: palette.accent }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.8, delay: 0.7, ease }}
      />

      <motion.h2
        className="text-balance font-display text-2xl font-light uppercase tracking-[0.3em] md:text-4xl"
        style={{ color: palette.fg }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 0.9 }}
      >
        {chapter.title}
      </motion.h2>

      {chapter.text && (
        <p
          className="mt-10 max-w-[22ch] text-balance font-display text-2xl italic font-light leading-snug sm:max-w-md md:mt-14 md:max-w-2xl md:text-4xl"
          style={{ color: palette.fg }}
        >
          <TextReveal text={chapter.text} delay={1.8} stagger={0.14} />
        </p>
      )}
    </motion.div>
  );
}

function Grade({ grade }) {
  if (!grade) return null;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {grade.tint && <div className="absolute inset-0" style={{ background: grade.tint }} />}
      {grade.vignette != null && (
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at center, transparent 55%, rgb(var(--c-ink) / ${grade.vignette}) 100%)`,
          }}
        />
      )}
    </div>
  );
}

export default function Chapter({ chapter, presets, timing, onSceneChange, onComplete }) {
  const [stage, setStage] = useState(chapter.titleDurationMs > 0 ? 'title' : 'scenes');

  // warm up the first scenes while the title card is on screen
  useEffect(() => {
    preloadScene(chapter.scenes[0]);
    preloadScene(chapter.scenes[1]);
  }, [chapter]);

  useEffect(() => {
    if (stage !== 'title') return undefined;
    const id = setTimeout(() => setStage('scenes'), chapter.titleDurationMs);
    return () => clearTimeout(id);
  }, [stage, chapter.titleDurationMs]);

  const exitSec = (chapter.exitFadeMs ?? 1400) / 1000;

  return (
    <motion.section
      className="absolute inset-0 overflow-hidden"
      style={{ background: chapter.palette.bg }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: exitSec, ease: 'easeInOut' } }}
      transition={{ duration: 1.2 }}
    >
      {stage === 'scenes' && (
        <>
          <Slideshow
            chapter={chapter}
            presets={presets[chapter.kenBurns]}
            timing={timing}
            onIndexChange={onSceneChange}
            onComplete={onComplete}
          />
          <Grade grade={chapter.grade} />
          <LightLeak level={chapter.lightLeak} />
        </>
      )}

      <AnimatePresence>
        {stage === 'title' && <TitleCard key="title" chapter={chapter} />}
      </AnimatePresence>
    </motion.section>
  );
}