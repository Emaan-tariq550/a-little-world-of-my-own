import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import TextReveal from './TextReveal.jsx';

export default function FinalScene({ ending, onReplay }) {
  const [stage, setStage] = useState('text'); // text | rest

  useEffect(() => {
    const id = setTimeout(() => setStage('rest'), ending.revealDelayMs + ending.holdMs);
    return () => clearTimeout(id);
  }, [ending.revealDelayMs, ending.holdMs]);

  return (
    <motion.section
      className="absolute inset-0 z-30 flex items-center justify-center bg-ink px-8 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1.2 } }}
      transition={{ duration: 1.5 }}
    >
      <AnimatePresence mode="wait">
        {stage === 'text' ? (
          <motion.p
            key="text"
            className="font-display text-3xl font-light italic tracking-wide text-champagne md:text-6xl"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: ending.fadeMs / 1000, ease: 'easeInOut' } }}
          >
            <TextReveal
              text={ending.text}
              delay={ending.revealDelayMs / 1000}
              stagger={0.35}
              duration={2.4}
            />
          </motion.p>
        ) : (
          <motion.button
            key="replay"
            type="button"
            onClick={onReplay}
            className="font-sans text-[0.62rem] font-light uppercase tracking-[0.5em] text-mauve transition-colors duration-500 hover:text-champagne focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-8 focus-visible:outline-gold/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ duration: 3, delay: 1 }}
          >
            {ending.replayLabel}
          </motion.button>
        )}
      </AnimatePresence>
    </motion.section>
  );
}