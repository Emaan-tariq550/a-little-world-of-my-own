import { AnimatePresence, motion } from 'framer-motion';

export default function ProgressIndicator({ progress, chapter, totalChapters, hidden }) {
  const pad = (n) => String(n).padStart(2, '0');

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-40"
      animate={{ opacity: hidden ? 0 : 1 }}
      transition={{ duration: 1.5 }}
    >
      <div className="absolute left-5 top-[max(1.25rem,env(safe-area-inset-top))] font-sans text-[0.6rem] font-light uppercase tracking-[0.4em] text-cream mix-blend-difference md:left-10 md:top-8">
        <AnimatePresence mode="wait">
          <motion.span
            key={chapter.id}
            className="block"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 0.85, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            {chapter.number}
            <span className="opacity-50"> / {pad(totalChapters)}</span>
            <span className="ml-4 hidden tracking-[0.25em] opacity-60 md:inline">
              {chapter.title}
            </span>
          </motion.span>
        </AnimatePresence>
      </div>

      <div className="absolute inset-x-5 bottom-[max(0.9rem,env(safe-area-inset-bottom))] h-px bg-cream/15 mix-blend-difference md:inset-x-10">
        <motion.div
          className="h-full w-full bg-cream/90"
          style={{ originX: 0 }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: progress }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  );
}