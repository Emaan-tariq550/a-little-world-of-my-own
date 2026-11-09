import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import useLowPower from '../hooks/useLowPower.js';

// If the photo's aspect differs a lot from its frame, show it whole (contain)
// over a soft backdrop instead of cropping the subject.
const FIT_HIGH = 1.3;
const FIT_LOW = 0.77;

const KB_NONE = {
  from: { scale: 1, x: '0%', y: '0%' },
  to: { scale: 1, x: '0%', y: '0%' },
};

export default function Photo({ item, kb, durationSec, backdrop = true, onSettled }) {
  const reduced = useReducedMotion();
  const lowPower = useLowPower();
  const boxRef = useRef(null);
  const imgRef = useRef(null);
  const settledRef = useRef(false);
  const onSettledRef = useRef(onSettled);
  const [status, setStatus] = useState('loading'); // loading | ok | error
  const [fit, setFit] = useState(item.fit ?? 'cover');

  useEffect(() => {
    onSettledRef.current = onSettled;
  });

  const handleLoad = useCallback(
    (el) => {
      if (settledRef.current) return;
      settledRef.current = true;
      const box = boxRef.current;
      if (!item.fit && box && el.naturalHeight && box.offsetWidth && box.offsetHeight) {
        const diff =
          el.naturalWidth / el.naturalHeight / (box.offsetWidth / box.offsetHeight);
        setFit(diff > FIT_HIGH || diff < FIT_LOW ? 'contain' : 'cover');
      }
      setStatus('ok');
      onSettledRef.current?.();
    },
    [item.fit]
  );

  const handleError = useCallback(() => {
    if (settledRef.current) return;
    settledRef.current = true;
    if (import.meta.env.DEV) console.warn('[story] Missing image:', item.src);
    setStatus('error');
    onSettledRef.current?.();
  }, [item.src]);

  // cached images can finish before React attaches onLoad
  useEffect(() => {
    const el = imgRef.current;
    if (el && el.complete) {
      if (el.naturalWidth) handleLoad(el);
      else handleError();
    }
  }, [handleLoad, handleError]);

  const k = kb ?? KB_NONE;
  const from = k.from;
  const to = reduced ? k.from : k.to;

  return (
    <div ref={boxRef} className="absolute inset-0 overflow-hidden">
      {status === 'error' ? (
        <div className="absolute inset-0 bg-gradient-to-br from-ink2 via-mauve/25 to-ink">
          {import.meta.env.DEV && (
            <p className="absolute inset-x-4 top-1/2 -translate-y-1/2 break-all text-center font-sans text-xs text-cream/60">
              Missing: {item.src}
            </p>
          )}
        </div>
      ) : (
        <>
          {backdrop && fit === 'contain' && (
            <img
              aria-hidden
              alt=""
              src={item.src}
              draggable={false}
              className={`absolute inset-0 h-full w-full scale-110 object-cover opacity-50 ${
                lowPower ? 'brightness-50' : 'blur-2xl'
              }`}
            />
          )}
          <motion.img
            ref={imgRef}
            src={item.src}
            alt={item.alt ?? ''}
            draggable={false}
            decoding="async"
            onLoad={(e) => handleLoad(e.currentTarget)}
            onError={handleError}
            className="absolute inset-0 h-full w-full will-change-transform"
            style={{ objectFit: fit, objectPosition: item.position ?? 'center' }}
            initial={{ opacity: 0, ...from }}
            animate={status === 'ok' ? { opacity: 1, ...to } : { opacity: 0, ...from }}
            transition={{
              duration: durationSec,
              ease: 'linear',
              opacity: { duration: 0.9, ease: 'easeOut' },
            }}
          />
        </>
      )}
    </div>
  );
}