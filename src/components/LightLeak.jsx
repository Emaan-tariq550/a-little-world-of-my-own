import { motion, useReducedMotion } from 'framer-motion';

const LEVELS = {
  soft: { opacity: 0.22, duration: 14 },
  strong: { opacity: 0.42, duration: 6.5 },
};

export default function LightLeak({ level }) {
  const reduced = useReducedMotion();
  const cfg = LEVELS[level];
  if (!cfg) return null;

  const animateA = reduced
    ? { opacity: cfg.opacity * 0.6 }
    : { opacity: [0, cfg.opacity, 0], x: ['-6%', '8%', '16%'] };
  const animateB = reduced
    ? { opacity: cfg.opacity * 0.4 }
    : { opacity: [0, cfg.opacity * 0.8, 0], x: ['8%', '-6%', '-14%'] };

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -left-1/4 -top-1/4 h-[95%] w-[75%] rounded-full will-change-transform"
        style={{
          background:
            'radial-gradient(closest-side, rgb(var(--c-gold) / 0.55), transparent)',
        }}
        animate={animateA}
        transition={{ duration: cfg.duration, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-1/4 -right-1/4 h-[85%] w-[70%] rounded-full will-change-transform"
        style={{
          background:
            'radial-gradient(closest-side, rgb(var(--c-rose) / 0.5), transparent)',
        }}
        animate={animateB}
        transition={{
          duration: cfg.duration * 1.3,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: cfg.duration * 0.3,
        }}
      />
    </div>
  );
}