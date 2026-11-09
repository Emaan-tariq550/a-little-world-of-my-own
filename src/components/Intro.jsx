import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';

const ease = [0.22, 0.61, 0.36, 1];

export default function Intro({ copy, onStart }) {
  const reduced = useReducedMotion();
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    if (clicked) return;
    setClicked(true);
    onStart();
  };

  return (
    <motion.section
      className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-ink px-6 text-center"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1.8, ease: 'easeInOut' } }}
    >
      {/* warm light */}
      <motion.div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 45% at 50% 55%, rgb(var(--c-gold) / 0.22), rgb(var(--c-rose) / 0.08) 45%, transparent 75%)',
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 5, delay: 1, ease: 'easeOut' }}
      />

      <motion.h1
        className="relative max-w-3xl text-balance font-display text-[2.6rem] font-light leading-[1.05] tracking-wide text-cream sm:text-6xl md:text-7xl lg:text-8xl"
        initial={{ opacity: 0, y: reduced ? 0 : 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 3.6, delay: 2.2, ease }}
      >
        {copy.title}
      </motion.h1>

      <motion.button
        type="button"
        onClick={handleClick}
        disabled={clicked}
        className="group relative mt-14 flex flex-col items-center gap-4 px-6 py-3 font-sans text-[0.68rem] font-light uppercase tracking-[0.5em] text-champagne/80 transition-colors duration-500 hover:text-cream focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-8 focus-visible:outline-gold/60 md:mt-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2.4, delay: 5.2, ease: 'easeOut' }}
      >
        <span className="pl-[0.5em]">{copy.cta}</span>
        <motion.span
          aria-hidden
          animate={reduced ? { y: 0 } : { y: [0, 8, 0] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ArrowDown size={16} strokeWidth={1} />
        </motion.span>
      </motion.button>
    </motion.section>
  );
}