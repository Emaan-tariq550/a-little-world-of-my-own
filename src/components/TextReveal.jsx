import { motion, useReducedMotion } from 'framer-motion';

const ease = [0.22, 0.61, 0.36, 1];

export default function TextReveal({
  text,
  delay = 0,
  stagger = 0.12,
  duration = 1.4,
  className = '',
}) {
  const reduced = useReducedMotion();
  const words = text.split(' ');

  return (
    <span className={className} aria-label={text}>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          aria-hidden
          className="inline-block whitespace-pre"
          initial={{ opacity: 0, y: reduced ? 0 : 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration, delay: delay + i * stagger, ease }}
        >
          {word}
          {i < words.length - 1 ? ' ' : ''}
        </motion.span>
      ))}
    </span>
  );
}