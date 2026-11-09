import { useCallback, useEffect, useRef } from 'react';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion';
import Photo from './Photo.jsx';
import useLowPower from '../hooks/useLowPower.js';

const ease = [0.22, 0.61, 0.36, 1];

function Caption({ text, className = '' }) {
  return (
    <motion.p
      className={`absolute z-10 max-w-[28ch] font-display text-lg italic text-cream [text-shadow:0_1px_18px_rgb(0_0_0/0.55)] md:text-2xl ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.6, delay: 1.2, ease }}
    >
      {text}
    </motion.p>
  );
}

function usePointerParallax(enabled) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 35, damping: 18, mass: 0.8 });
  const sy = useSpring(y, { stiffness: 35, damping: 18, mass: 0.8 });

  useEffect(() => {
    if (!enabled) return undefined;
    const move = (e) => {
      x.set(e.clientX / window.innerWidth - 0.5);
      y.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, [enabled, x, y]);

  return { sx, sy };
}

function OffsetLayout({ scene, index, durationSec, preset, parallax, onSettled }) {
  const reduced = useReducedMotion();
  const lowPower = useLowPower();
  const { sx, sy } = usePointerParallax(parallax && !reduced);

  const frontX = useTransform(sx, [-0.5, 0.5], [-18, 18]);
  const frontY = useTransform(sy, [-0.5, 0.5], [-10, 10]);
  const backX = useTransform(sx, [-0.5, 0.5], [14, -14]);
  const backY = useTransform(sy, [-0.5, 0.5], [8, -8]);

  const alignRight = (scene.align ?? (index % 2 ? 'left' : 'right')) === 'right';

  // frame on one side, caption on the opposite side (desktop); centered on mobile
  const frameSide = alignRight
    ? 'right-[6%] md:right-[9%]'
    : 'left-[6%] md:left-[9%]';
  const captionSide = alignRight
    ? 'md:left-[9%] md:right-auto md:text-left'
    : 'md:left-auto md:right-[9%] md:text-right';

  return (
    <div className="absolute inset-0 bg-ink2">
      <motion.img
        aria-hidden
        alt=""
        src={scene.src}
        draggable={false}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
        style={{ x: backX, y: backY }}
        className={`absolute -inset-[8%] h-[116%] w-[116%] max-w-none object-cover opacity-40 ${
          lowPower ? 'brightness-50' : 'blur-2xl'
        }`}
      />

      <motion.div
        style={{ x: frontX, y: frontY }}
        className={`absolute top-[8%] h-[80%] w-[88%] overflow-hidden shadow-[0_30px_80px_-20px_rgb(0_0_0/0.6)] md:top-[10%] md:h-[78%] md:w-[52%] ${frameSide}`}
      >
        <Photo
          item={scene}
          kb={preset}
          durationSec={durationSec}
          backdrop={false}
          onSettled={onSettled}
        />
      </motion.div>

      {scene.caption && (
        <Caption
          text={scene.caption}
          className={`bottom-[3.5%] left-1/2 -translate-x-1/2 text-center md:bottom-[12%] md:translate-x-0 ${captionSide}`}
        />
      )}
    </div>
  );
}

function PairLayout({ scene, durationSec, pick, settle }) {
  const reduced = useReducedMotion();
  return (
    <div className="absolute inset-0 flex flex-col gap-2 bg-ink p-3 md:flex-row md:gap-4 md:p-10">
      {scene.items.map((item, i) => (
        <motion.div
          key={item.src}
          className={`relative min-h-0 min-w-0 flex-1 overflow-hidden ${
            i === 1 ? 'md:mt-12' : 'md:mb-12'
          }`}
          initial={{ y: reduced ? 0 : i ? 30 : -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.8, ease }}
        >
          <Photo
            item={item}
            kb={pick(i)}
            durationSec={durationSec}
            onSettled={() => settle(i)}
          />
        </motion.div>
      ))}
      {scene.caption && (
        <Caption
          text={scene.caption}
          className="bottom-[5%] left-1/2 -translate-x-1/2 text-center"
        />
      )}
    </div>
  );
}

export default function ImageScene({
  scene,
  index,
  durationSec,
  presets,
  parallax,
  onReady,
}) {
  const items = scene.type === 'pair' ? scene.items : [scene];
  const settled = useRef(new Set());

  const settle = useCallback(
    (i) => {
      settled.current.add(i);
      if (settled.current.size >= items.length) onReady();
    },
    [items.length, onReady]
  );

  const pick = (n) =>
    presets?.length ? presets[(index + n) % presets.length] : undefined;

  const layout = scene.type === 'pair' ? 'pair' : scene.layout ?? 'full';

  if (layout === 'pair') {
    return (
      <PairLayout
        scene={scene}
        durationSec={durationSec}
        pick={pick}
        settle={settle}
      />
    );
  }

  if (layout === 'offset') {
    return (
      <OffsetLayout
        scene={scene}
        index={index}
        durationSec={durationSec}
        preset={pick(0)}
        parallax={parallax}
        onSettled={() => settle(0)}
      />
    );
  }

  return (
    <div className="absolute inset-0">
      <Photo
        item={scene}
        kb={pick(0)}
        durationSec={durationSec}
        onSettled={() => settle(0)}
      />
      {scene.caption && (
        <>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/60 to-transparent" />
          <Caption
            text={scene.caption}
            className="bottom-[8%] left-1/2 -translate-x-1/2 text-center md:left-[8%] md:translate-x-0 md:text-left"
          />
        </>
      )}
    </div>
  );
}