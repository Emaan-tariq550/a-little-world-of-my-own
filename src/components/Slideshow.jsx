import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import ImageScene from './ImageScene.jsx';
import VideoScene from './VideoScene.jsx';
import { resolveTransition } from '../config/transitions.js';
import { preloadScene } from '../utils/media.js';
import useLowPower from '../hooks/useLowPower.js';

export default function Slideshow({ chapter, presets, timing, onIndexChange, onComplete }) {
  const { scenes } = chapter;
  const reduced = useReducedMotion();
  const lowPower = useLowPower();
  const t = useMemo(
    () => resolveTransition(chapter.transition, { reduced, lowPower }),
    [chapter.transition, reduced, lowPower]
  );

  const [index, setIndex] = useState(0);
  const [readyIndex, setReadyIndex] = useState(-1);
  const [showLoader, setShowLoader] = useState(false);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const onIndexRef = useRef(onIndexChange);

  useEffect(() => {
    onCompleteRef.current = onComplete;
    onIndexRef.current = onIndexChange;
  });

  const scene = scenes[index];
  const isVideo = scene?.type === 'video';
  const duration = scene?.duration ?? chapter.duration;

  const complete = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    onCompleteRef.current?.();
  }, []);

  // called by images (timer) and videos (real 'ended' event)
  const advance = useCallback(() => {
    if (index < scenes.length - 1) setIndex(index + 1);
    else complete();
  }, [index, scenes.length, complete]);

  // empty chapter safety
  useEffect(() => {
    if (!scene) complete();
  }, [scene, complete]);

  // on scene change: report, preload ahead, failsafe against stuck loading
  useEffect(() => {
    if (!scene) return undefined;
    onIndexRef.current?.(index);
    for (let k = 1; k <= timing.preloadAhead; k += 1) preloadScene(scenes[index + k]);
    if (isVideo) return undefined;
    const failsafe = setTimeout(() => setReadyIndex(index), timing.loadTimeoutMs);
    return () => clearTimeout(failsafe);
  }, [index, scene, scenes, timing, isVideo]);

  // image timer starts only once the image is actually visible
  useEffect(() => {
    if (!scene || isVideo || readyIndex !== index) return undefined;
    const id = setTimeout(advance, duration);
    return () => clearTimeout(id);
  }, [scene, isVideo, readyIndex, index, duration, advance]);

  // soft loading cue, only if an image is slow (>0.9s)
  useEffect(() => {
    if (!scene || isVideo || readyIndex === index) {
      setShowLoader(false);
      return undefined;
    }
    const id = setTimeout(() => setShowLoader(true), 900);
    return () => clearTimeout(id);
  }, [scene, isVideo, readyIndex, index]);

  const handleReady = useCallback(() => setReadyIndex(index), [index]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-ink">
      <AnimatePresence initial>
        {scene && (
          <motion.div
            key={`${chapter.id}-${index}`}
            className="absolute inset-0 will-change-[opacity,transform]"
            initial={t.initial}
            animate={t.animate}
            exit={t.exit}
            transition={t.transition}
          >
            {isVideo ? (
              <VideoScene scene={scene} timing={timing} onEnded={advance} />
            ) : (
              <ImageScene
                scene={scene}
                index={index}
                durationSec={(duration + t.durationMs) / 1000}
                presets={presets}
                parallax={chapter.parallax}
                onReady={handleReady}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLoader && (
          <motion.div
            key="loader"
            aria-hidden
            className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.span
              className="block h-1.5 w-1.5 rounded-full bg-gold"
              animate={reduced ? { opacity: 0.7 } : { opacity: [0.2, 0.9, 0.2], scale: [1, 1.8, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}