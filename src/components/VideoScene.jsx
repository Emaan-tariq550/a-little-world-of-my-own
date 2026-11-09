import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Volume2 } from 'lucide-react';
import { getPlayableSources } from '../utils/media.js';
import { musicController } from '../utils/musicController.js';

export default function VideoScene({ scene, timing, onEnded }) {
  const videoRef = useRef(null);
  const doneRef = useRef(false);   // finish() already ran
  const beganRef = useRef(false);  // this instance owns the audio channel
  const startedRef = useRef(false);
  const failedSources = useRef(0);
  const failTimer = useRef(null);
  const stallTimer = useRef(null);
  const onEndedRef = useRef(onEnded);
  const [loaded, setLoaded] = useState(false);
  const [muted, setMuted] = useState(false);
  const sources = useMemo(() => getPlayableSources(scene), [scene]);

  useEffect(() => {
    onEndedRef.current = onEnded;
  });

  // single exit point: music resumes FIRST, then the slideshow moves on
  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    clearTimeout(stallTimer.current);
    musicController.endVideo();
    onEndedRef.current?.();
  }, []);

  const fail = useCallback(() => {
    if (doneRef.current || failTimer.current) return;
    if (import.meta.env.DEV) console.warn('[story] Video failed:', scene.src ?? scene.sources);
    failTimer.current = setTimeout(finish, 600);
  }, [finish, scene]);

  const handleSourceError = () => {
    failedSources.current += 1;
    if (failedSources.current >= sources.length) fail();
  };

  // real media events decide completion; timers are only watchdogs
  const handleWaiting = () => {
    clearTimeout(stallTimer.current);
    stallTimer.current = setTimeout(() => {
      if (import.meta.env.DEV) console.warn('[story] Video stalled, skipping');
      finish();
    }, timing.videoStallTimeoutMs);
  };

  const handlePlaying = () => {
    startedRef.current = true;
    clearTimeout(stallTimer.current);
  };

  useEffect(() => {
    if (!sources.length) {
      fail(); // nothing this browser can play
      return () => clearTimeout(failTimer.current);
    }

    const v = videoRef.current;
    if (!v) return undefined;
    let cancelled = false;
    let startId;

    const run = async () => {
      beganRef.current = true;
      await musicController.beginVideo(); // music silent + paused, time saved
      if (cancelled) return;
      await new Promise((resolve) => {
        startId = setTimeout(resolve, timing.videoStartDelayMs);
      });
      if (cancelled) return;
      try {
        await v.play(); // original audio ON
      } catch {
        if (cancelled) return;
        try {
          v.muted = true; // browser refused sound -> muted fallback
          setMuted(true);
          await v.play();
        } catch {
          if (!cancelled) finish();
        }
      }
    };
    run();

    const watchdog = setTimeout(() => {
      if (!startedRef.current) finish();
    }, timing.videoStartTimeoutMs);

    return () => {
      cancelled = true;
      clearTimeout(startId);
      clearTimeout(watchdog);
      clearTimeout(failTimer.current);
      clearTimeout(stallTimer.current);
      v.pause();
      // only release the audio channel if THIS instance still holds it
      if (beganRef.current && !doneRef.current) musicController.endVideo();
    };
  }, [sources, fail, finish, timing.videoStartDelayMs, timing.videoStartTimeoutMs]);

  const unmute = () => {
    const v = videoRef.current;
    if (v) v.muted = false;
    setMuted(false);
  };

  return (
    <div className="absolute inset-0 bg-ink">
      <video
        ref={videoRef}
        className={`h-full w-full object-contain transition-[opacity,transform] duration-[1800ms] ease-out motion-reduce:scale-100 motion-reduce:transition-opacity ${
          loaded ? 'scale-100 opacity-100' : 'scale-[1.03] opacity-0'
        }`}
        poster={scene.poster}
        playsInline
        preload="auto"
        disablePictureInPicture
        controlsList="nodownload noremoteplayback"
        muted={muted}
        onLoadedData={() => setLoaded(true)}
        onPlaying={handlePlaying}
        onWaiting={handleWaiting}
        onEnded={finish}
        onError={fail}
      >
        {sources.map((s) => (
          <source key={s.src} src={s.src} type={s.type} onError={handleSourceError} />
        ))}
      </video>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_60%,rgb(var(--c-ink)/0.55)_100%)]" />

      {muted && (
        <button
          type="button"
          aria-label="Turn video sound on"
          onClick={unmute}
          className="absolute bottom-[max(2.5rem,env(safe-area-inset-bottom))] right-5 z-10 rounded-full border border-cream/30 p-3 text-cream/80 backdrop-blur-sm transition-colors hover:text-cream md:right-10"
        >
          <Volume2 size={16} strokeWidth={1.25} />
        </button>
      )}
    </div>
  );
}