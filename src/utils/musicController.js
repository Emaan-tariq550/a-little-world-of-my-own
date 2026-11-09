/*
  Single, centralized background-music controller.
  - exactly ONE <audio> element for the whole app (module singleton)
  - video sync: beginVideo() pauses + saves time, endVideo() resumes from it
  - manual pause is respected (never auto-resumed after a video)
*/

const clamp01 = (n) => Math.min(1, Math.max(0, n));
const easeInOut = (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
const log = (...args) => {
  if (import.meta.env.DEV) console.info('[music]', ...args);
};

const INITIAL = { status: 'idle', muted: false, suspended: false };
// status: idle | playing | paused | blocked | error | stopped
// suspended: true while a video owns the audio channel

class MusicController {
  constructor() {
    this.audio = null;
    this.cfg = null;
    this.listeners = new Set();
    this.cleanups = [];
    this.snap = { ...INITIAL };

    this.fadeTimer = null;
    this.fadeResolve = null;
    this.seq = 0; // bumps whenever a pending video/stop sequence must be cancelled

    this.videoActive = false;
    this.resumeAfterVideo = false;
    this.savedTime = 0;
    this.userPaused = false;
    this.ownPause = false; // marks pauses WE caused, so the 'pause' event isn't mistaken for the user
    this.volumeLocked = false; // iOS ignores audio.volume
  }

  /* ---------- store API (useSyncExternalStore) ---------- */
  subscribe = (fn) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };

  getSnapshot = () => this.snap;

  _set(patch) {
    let changed = false;
    for (const k in patch) {
      if (this.snap[k] !== patch[k]) {
        changed = true;
        break;
      }
    }
    if (!changed) return;
    this.snap = { ...this.snap, ...patch };
    this.listeners.forEach((l) => l());
  }

  _on(el, evt, fn) {
    el.addEventListener(evt, fn);
    this.cleanups.push(() => el.removeEventListener(evt, fn));
  }

  /* ---------- lifecycle ---------- */
  init(cfg) {
    if (this.audio) return; // never create a second instance
    this.cfg = cfg;

    const a = document.createElement('audio');
    a.preload = 'auto';
    a.loop = !!cfg.loop;
    a.setAttribute('playsinline', '');
    this.audio = a;

    // volume support probe (iOS Safari keeps volume at 1)
    a.volume = 0.5;
    this.volumeLocked = Math.abs(a.volume - 0.5) > 0.01;
    a.volume = 0;

    const src = this._pickSource(a, cfg.sources);
    if (!src) {
      log('no playable audio source for this browser');
      this._set({ status: 'error' });
      return;
    }
    a.src = src;

    this._on(a, 'error', () => {
      log('audio error', a.error?.code);
      this._set({ status: 'error' });
    });

    this._on(a, 'ended', () => {
      if (!a.loop) this._set({ status: 'stopped' });
    });

    // external pause (OS media key, call, headphones...) = treat like manual pause
    this._on(a, 'pause', () => {
      if (this.ownPause) {
        this.ownPause = false;
        return;
      }
      if (a.ended || this.videoActive) return;
      if (this.snap.status === 'playing') {
        this.userPaused = true;
        this._set({ status: 'paused' });
      }
    });

    this._on(a, 'playing', () => {
      if (this.snap.status === 'paused' || this.snap.status === 'blocked') {
        this.userPaused = false;
        this._set({ status: 'playing' });
      }
    });

    if (import.meta.env.DEV) window.__music = this;
  }

  destroy() {
    this.seq += 1;
    this._cancelFade();
    this.cleanups.forEach((fn) => fn());
    this.cleanups = [];
    const a = this.audio;
    if (a) {
      this.ownPause = false;
      a.pause();
      a.removeAttribute('src');
      a.load();
    }
    this.audio = null;
    this.videoActive = false;
    this.resumeAfterVideo = false;
    this.userPaused = false;
    this.snap = { ...INITIAL };
    this.listeners.forEach((l) => l());
  }

  _pickSource(a, sources = []) {
    for (const s of sources) {
      if (!s.type || a.canPlayType(s.type) !== '') return s.src;
    }
    return null;
  }

  /* ---------- volume / fades ---------- */
  _setVolume(v) {
    if (this.volumeLocked || !this.audio) return;
    this.audio.volume = clamp01(v);
  }

  _cancelFade() {
    if (this.fadeTimer) clearInterval(this.fadeTimer);
    this.fadeTimer = null;
    const r = this.fadeResolve;
    this.fadeResolve = null;
    if (r) r();
  }

  _fade(target, ms) {
    this._cancelFade();
    const a = this.audio;
    if (!a || this.volumeLocked || ms <= 0) {
      this._setVolume(target);
      return Promise.resolve();
    }
    const from = a.volume;
    const t0 = performance.now();

    return new Promise((resolve) => {
      this.fadeResolve = resolve;
      this.fadeTimer = setInterval(() => {
        if (!this.audio) {
          this._cancelFade();
          return;
        }
        const p = clamp01((performance.now() - t0) / ms);
        this.audio.volume = clamp01(from + (target - from) * easeInOut(p));
        if (p >= 1) {
          clearInterval(this.fadeTimer);
          this.fadeTimer = null;
          this.fadeResolve = null;
          resolve();
        }
      }, 40);
    });
  }

  async _play(fadeMs) {
    const a = this.audio;
    if (!a) return false;
    this._cancelFade();
    this._setVolume(0);
    try {
      await a.play();
    } catch (e) {
      if (e?.name === 'AbortError') return false; // interrupted by our own pause()
      this._set({ status: e?.name === 'NotAllowedError' ? 'blocked' : 'error' });
      log('play() rejected:', e?.name);
      return false;
    }
    if (!this.audio) return false;
    this._set({ status: 'playing' });
    if (!this.videoActive) this._fade(this.cfg.volume, fadeMs);
    return true;
  }

  _pauseOwn() {
    const a = this.audio;
    if (!a) return;
    this.ownPause = !a.paused; // only expect a 'pause' event if one will fire
    a.pause();
  }

  /* ---------- public: start / user controls ---------- */
  // MUST be called from inside a click handler (autoplay policy)
  async start() {
    const a = this.audio;
    if (!a || this.snap.status === 'error') return;
    this.userPaused = false;
    a.muted = this.snap.muted;
    if (this.cfg.startAt && a.currentTime < 0.1) {
      try {
        a.currentTime = this.cfg.startAt;
      } catch {
        /* metadata not ready yet; start from 0 */
      }
    }
    await this._play(this.cfg.startFadeMs);
  }

  async toggle() {
    const a = this.audio;
    if (!a || this.videoActive || this.snap.status === 'error') return;

    if (this.snap.status === 'playing') {
      this.userPaused = true;
      await this._fade(0, 400);
      if (!this.userPaused || this.videoActive || !this.audio) return;
      this._pauseOwn();
      this._set({ status: 'paused' });
      log('manual pause @', a.currentTime.toFixed(2));
    } else {
      this.userPaused = false;
      if (this.snap.status === 'stopped' || a.ended) a.currentTime = 0;
      await this._play(this.cfg.resumeFadeMs);
    }
  }

  toggleMute() {
    const muted = !this.snap.muted;
    if (this.audio) this.audio.muted = muted;
    this._set({ muted });
  }

  /* ---------- public: video sync ---------- */
  // Resolves once the soundtrack is silent + paused (or was not playing).
  async beginVideo() {
    if (this.videoActive) return;
    this.videoActive = true;
    this._set({ suspended: true });

    const a = this.audio;
    if (!a || a.paused || this.snap.status !== 'playing') {
      this.resumeAfterVideo = false; // manual pause / blocked / error: stay as is
      return;
    }

    this.resumeAfterVideo = true;
    const token = ++this.seq;
    await this._fade(0, this.cfg.videoFadeOutMs);
    if (token !== this.seq || !this.videoActive || !this.audio) return;

    this.savedTime = a.currentTime;
    this._pauseOwn();
    log('paused for video @', this.savedTime.toFixed(3));
  }

  // Safe to call many times; only the first call after beginVideo() does anything.
  async endVideo() {
    if (!this.videoActive) return;
    this.videoActive = false;
    this.seq += 1;
    this._set({ suspended: false });

    const a = this.audio;
    if (!a || !this.resumeAfterVideo || this.userPaused || this.snap.status !== 'playing') {
      this.resumeAfterVideo = false;
      return;
    }
    this.resumeAfterVideo = false;

    if (a.paused) {
      const drift = Math.abs(a.currentTime - this.savedTime);
      if (drift > (this.cfg.resumeDriftToleranceSec ?? 0.25)) a.currentTime = this.savedTime;
      log('resuming @', this.savedTime.toFixed(3), `(drift ${drift.toFixed(3)}s)`);
      await this._play(this.cfg.resumeFadeMs);
    } else {
      // video ended before the fade-out finished: just bring the volume back
      this._fade(this.cfg.volume, this.cfg.resumeFadeMs);
    }
  }

  /* ---------- public: ending / replay ---------- */
  async fadeOutAndStop(ms) {
    const a = this.audio;
    if (!a || this.snap.status === 'stopped' || this.snap.status === 'error') return;
    const token = ++this.seq;
    this.userPaused = true; // never auto-resume after the story ends
    this.resumeAfterVideo = false;
    this.videoActive = false;
    if (!a.paused) await this._fade(0, ms);
    if (token !== this.seq || !this.audio) return; // replay started meanwhile
    this._pauseOwn();
    try {
      a.currentTime = 0;
    } catch {
      /* ignore */
    }
    this._set({ status: 'stopped', suspended: false });
    log('stopped gracefully');
  }

  async restart() {
    const a = this.audio;
    if (!a || this.snap.status === 'error') return;
    this.seq += 1;
    this.videoActive = false;
    this.resumeAfterVideo = false;
    this.userPaused = false;
    this._set({ suspended: false });
    a.currentTime = 0;
    await this._play(this.cfg.startFadeMs);
  }
}

export const musicController = new MusicController();