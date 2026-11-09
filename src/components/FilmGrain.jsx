import { motion } from 'framer-motion';

export default function FilmGrain() {
  return (
    <motion.div
      aria-hidden
      className="film-grain"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.075 }}
      transition={{ duration: 4, ease: 'easeOut' }}
    />
  );
}