const ease = [0.22, 0.61, 0.36, 1];

/*
  The outgoing layer never drops to opacity 0 (it stays ~0.99 underneath),
  so the incoming layer fades in on top = clean crossfade, no dark dip.
  (0.99 instead of 1 makes sure Framer actually runs the exit animation.)
*/
export const transitions = {
  fade: {
    duration: 1.8,
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0.99 },
  },
  dreamy: {
    duration: 2.6,
    lite: 'fade',
    initial: { opacity: 0, filter: 'blur(14px)' },
    animate: { opacity: 1, filter: 'blur(0px)' },
    exit: { opacity: 0.99 },
  },
  drift: {
    duration: 1.6,
    initial: { opacity: 0, x: '6%' },
    animate: { opacity: 1, x: '0%' },
    exit: { opacity: 0.99, x: '-4%' },
  },
  punch: {
    duration: 0.8,
    initial: { opacity: 0, scale: 1.12, rotate: 1.5 },
    animate: { opacity: 1, scale: 1, rotate: 0 },
    exit: { opacity: 0.99, scale: 0.97 },
  },
  slow: {
    duration: 3.4,
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0.99 },
  },
};

export function resolveTransition(name, { reduced = false, lowPower = false } = {}) {
  let def = transitions[name] ?? transitions.fade;
  if (lowPower && def.lite) def = { ...transitions[def.lite], duration: def.duration };
  if (reduced) def = { ...transitions.fade, duration: 0.8 };

  return {
    initial: def.initial,
    animate: def.animate,
    exit: { ...def.exit, transition: { duration: def.duration, ease } },
    transition: { duration: def.duration, ease },
    durationMs: def.duration * 1000,
  };
}