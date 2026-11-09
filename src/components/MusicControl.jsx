import { motion, useReducedMotion } from 'framer-motion';
import { Pause, Play, Volume2, VolumeX } from 'lucide-react';
import useMusic from '../hooks/useMusic.js';

const BARS = [
  { d: 1.1, delay: 0 },
  { d: 0.8, delay: 0.15 },
  { d: 1.3, delay: 0.3 },
  { d: 0.9, delay: 0.05 },
];

export default function MusicControl({ labels }) {
  const reduced = useReducedMotion();
  const { status, muted, suspended, controller } = useMusic();

  // 'idle' = the click just happened and play() is resolving -> treat as playing
  const isPlaying = status === 'playing' || status === 'idle';
  const active = isPlaying && !suspended && !muted;
  const disabled = suspended || status === 'error';

  let stateKey = 'paused';
  if (status === 'error') stateKey = 'error';
  else if (suspended) stateKey = 'suspended';
  else if (status === 'blocked') stateKey = 'blocked';
  else if (status === 'stopped') stateKey = 'stopped';
  else if (isPlaying) stateKey = muted ? 'muted' : 'playing';

  const btn =
    'p-2.5 transition-opacity duration-300 hover:opacity-100 disabled:cursor-default disabled:hover:opacity-100 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-cream/70';

  return (
    <motion.div
      className="absolute right-3 top-[max(0.75rem,env(safe-area-inset-top))] z-50 flex items-center text-cream mix-blend-difference md:right-8 md:top-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: disabled ? 0.45 : 0.85 }}
      transition={{ duration: 1.4 }}
    >
      <span
        aria-live="polite"
        className="sr-only mr-2 font-sans text-[0.58rem] font-light uppercase tracking-[0.35em] opacity-70 md:not-sr-only"
      >
        {labels[stateKey]}
      </span>

      <div aria-hidden className="mr-1 flex h-4 items-center gap-[3px]">
        {BARS.map((b, i) => (
          <motion.span
            key={i}
            className="block h-full w-[2px] origin-center bg-cream"
            animate={
              active && !reduced
                ? { scaleY: [0.25, 1, 0.45, 0.9, 0.25] }
                : { scaleY: active ? 0.6 : 0.18 }
            }
            transition={
              active && !reduced
                ? { duration: b.d * 1.6, repeat: Infinity, ease: 'easeInOut', delay: b.delay }
                : { duration: 0.6 }
            }
          />
        ))}
      </div>

      <button
        type="button"
        disabled={disabled}
        aria-label={isPlaying ? labels.pause : labels.play}
        onClick={() => controller.toggle()}
        className={`${btn} opacity-80`}
      >
        {isPlaying ? <Pause size={15} strokeWidth={1.25} /> : <Play size={15} strokeWidth={1.25} />}
      </button>

      <button
        type="button"
        disabled={status === 'error'}
        aria-label={muted ? labels.unmute : labels.mute}
        onClick={() => controller.toggleMute()}
        className={`${btn} opacity-80`}
      >
        {muted ? <VolumeX size={15} strokeWidth={1.25} /> : <Volume2 size={15} strokeWidth={1.25} />}
      </button>
    </motion.div>
  );
}