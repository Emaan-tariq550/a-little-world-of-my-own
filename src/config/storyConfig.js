/* ------------------------------------------------------------------
   EDIT THIS FILE to add / remove / replace / reorder media.

   public/assets/images/chapterN/imageNN.jpg
   public/assets/videos/chapterN/video-NN.mp4
   public/assets/audio/<song>.mp3

   Extension likhna zaroori nahi: 'chapter1/image01' => image01.jpg
   Alag extension ho to poora naam likho: 'chapter1/image01.png'
   ------------------------------------------------------------------ */

export const assetPaths = {
  images: '/assets/images/',
  videos: '/assets/videos/',
  audio: '/assets/audio/',
};

export const defaultExt = {
  image: 'jpg',
  video: 'mp4',
};

const withExt = (file, ext) => (/\.[a-z0-9]+$/i.test(file) ? file : `${file}.${ext}`);

// image('chapter1/image01', { caption: '...' })
const image = (file, extra = {}) => ({
  type: 'image',
  src: `${assetPaths.images}${withExt(file, defaultExt.image)}`,
  ...extra,
});

// video('chapter3/video-01')
// multiple formats: video(null, { sources: [{ src: '/assets/videos/chapter3/video-01.webm' }, { src: '/assets/videos/chapter3/video-01.mp4' }] })
const video = (file, extra = {}) => ({
  type: 'video',
  ...(file ? { src: `${assetPaths.videos}${withExt(file, defaultExt.video)}` } : {}),
  ...extra,
});

// pair(['chapter2/image02', 'chapter2/image03'])
const pair = (files, extra = {}) => ({
  type: 'pair',
  items: files.map((f) => ({ src: `${assetPaths.images}${withExt(f, defaultExt.image)}` })),
  ...extra,
});

export const timing = {
  loadTimeoutMs: 8000,         // max wait for an image before moving on
  videoStartDelayMs: 400,      // small pause after the music has faded out
  videoStartTimeoutMs: 15000,  // skip a video that never starts
  videoStallTimeoutMs: 20000,  // skip a video that freezes mid-playback
  preloadAhead: 2,             // how many upcoming scenes to preload
};

export const music = {
  sources: [
    { src: `${assetPaths.audio}love-me-like-you-do.mp3`, type: 'audio/mpeg' },
    // { src: `${assetPaths.audio}love-me-like-you-do.ogg`, type: 'audio/ogg' },
  ],
  volume: 0.75,
  loop: true,                  // soundtrack never goes silent if the story outlasts the song
  startAt: 0,                  // seconds
  startFadeMs: 2500,
  videoFadeOutMs: 700,
  resumeFadeMs: 1500,
  endFadeMs: 8000,
  resumeDriftToleranceSec: 0.25,
  labels: {
    playing: 'Playing',
    muted: 'Muted',
    paused: 'Paused',
    suspended: 'Original audio',
    blocked: 'Tap to play',
    error: 'Audio unavailable',
    stopped: 'The end',
    play: 'Play music',
    pause: 'Pause music',
    mute: 'Mute music',
    unmute: 'Unmute music',
  },
};

export const kenBurns = {
  slow: [
    { from: { scale: 1.04, x: '0%', y: '0%' }, to: { scale: 1.14, x: '-2%', y: '-1%' } },
    { from: { scale: 1.12, x: '1.5%', y: '0%' }, to: { scale: 1.03, x: '-1%', y: '1%' } },
    { from: { scale: 1.05, x: '-1.5%', y: '1%' }, to: { scale: 1.15, x: '1.5%', y: '-1%' } },
    { from: { scale: 1.14, x: '0%', y: '-1%' }, to: { scale: 1.04, x: '0%', y: '1.5%' } },
  ],
  gentle: [
    { from: { scale: 1.02, x: '0%', y: '0%' }, to: { scale: 1.08, x: '-1%', y: '0%' } },
    { from: { scale: 1.08, x: '1%', y: '0%' }, to: { scale: 1.02, x: '0%', y: '0%' } },
  ],
  dynamic: [
    { from: { scale: 1.0, x: '0%', y: '0%' }, to: { scale: 1.22, x: '-3%', y: '-2%' } },
    { from: { scale: 1.2, x: '3%', y: '1%' }, to: { scale: 1.02, x: '-2%', y: '0%' } },
    { from: { scale: 1.03, x: '-3%', y: '2%' }, to: { scale: 1.24, x: '2%', y: '-2%' } },
  ],
};

const darkPalette = {
  bg: 'rgb(var(--c-ink))',
  fg: 'rgb(var(--c-cream))',
  accent: 'rgb(var(--c-gold))',
};

const brightPalette = {
  bg: 'rgb(var(--c-cream))',
  fg: 'rgb(var(--c-ink))',
  accent: 'rgb(var(--c-mauve))',
};

export const story = {
  intro: {
    title: 'A little world of my own.',
    cta: 'Step Inside',
  },

  timing,
  music,
  kenBurns,

  chapters: [
    /* ───────────── CHAPTER 01 ───────────── */
    {
      id: 'ch1',
      number: '01',
      title: 'A Different Kind of Beautiful',
      text: 'Somewhere between all the ordinary days...',
      titleDurationMs: 6500,
      exitFadeMs: 1800,
      palette: darkPalette,
      grade: { tint: 'rgb(var(--c-gold) / 0.07)', vignette: 0.6 },
      lightLeak: 'soft',
      transition: 'dreamy',
      kenBurns: 'slow',
      duration: 6500,
      parallax: false,
      scenes: [
        image('chapter1/image01'),
        image('chapter1/image02'),
        image('chapter1/image03'),
        image('chapter1/image04'),
        image('chapter1/image05'),
      ],
    },

    /* ───────────── CHAPTER 02 ───────────── */
    {
      id: 'ch2',
      number: '02',
      title: 'In My Own Little World',
      text: 'There is a whole world in the little things.',
      titleDurationMs: 6000,
      exitFadeMs: 1400,
      palette: brightPalette,
      grade: { tint: 'rgb(var(--c-cream) / 0.08)', vignette: 0.25 },
      lightLeak: 'soft',
      transition: 'drift',
      kenBurns: 'gentle',
      duration: 4800,
      parallax: true,
      scenes: [
        image('chapter2/image01', { layout: 'offset', align: 'right' }),
        pair(['chapter2/image02', 'chapter2/image03'], { duration: 5200 }),
        image('chapter2/image04', { layout: 'full' }),
        image('chapter2/image05', { layout: 'offset', align: 'left' }),
        pair(['chapter2/image06', 'chapter2/image07'], { duration: 5200 }),
        image('chapter2/image08', { layout: 'full' }),
      ],
    },

    /* ───────────── CHAPTER 03 ───────────── */
    {
      id: 'ch3',
      number: '03',
      title: 'A Thousand Little Versions',
      text: 'Different days. Different moods. Still, always a story.',
      titleDurationMs: 6500,
      exitFadeMs: 1400,
      palette: darkPalette,
      grade: { tint: 'rgb(var(--c-rose) / 0.06)', vignette: 0.5 },
      lightLeak: 'none',
      transition: 'fade',
      kenBurns: 'gentle',
      duration: 4200,
      parallax: false,
      scenes: [
        image('chapter3/image01'),
        image('chapter3/image02'),
        video('chapter3/video-01'),
        image('chapter3/image03'),
        image('chapter3/image04'),
        video('chapter3/video-02'),
        image('chapter3/image05'),
      ],
    },

    /* ───────────── CHAPTER 04 ───────────── */
    {
      id: 'ch4',
      number: '04',
      title: 'The Feeling of Being Alive',
      text: null, // intentionally no text
      titleDurationMs: 2800,
      exitFadeMs: 1200,
      palette: darkPalette,
      grade: { tint: 'rgb(var(--c-gold) / 0.05)', vignette: 0.45 },
      lightLeak: 'strong',
      transition: 'punch',
      kenBurns: 'dynamic',
      duration: 2600,
      parallax: false,
      scenes: [
        image('chapter4/image01', { duration: 3000 }),
        image('chapter4/image02', { duration: 1200 }),
        image('chapter4/image03', { duration: 1200 }),
        image('chapter4/image04', { duration: 1200 }),
        video('chapter4/video-01'),
        image('chapter4/image05', { duration: 2600 }),
        image('chapter4/image06', { duration: 1100 }),
        image('chapter4/image07', { duration: 1100 }),
        image('chapter4/image08', { duration: 3200 }),
      ],
    },

    /* ───────────── CHAPTER 05 ───────────── */
    {
      id: 'ch5',
      number: '05',
      title: 'And The Story Goes On',
      text: "And perhaps, the best part is that the story isn't over yet.",
      titleDurationMs: 8000,
      exitFadeMs: 4500, // long fade into darkness
      palette: darkPalette,
      grade: { tint: 'rgb(var(--c-mauve) / 0.06)', vignette: 0.6 },
      lightLeak: 'soft',
      transition: 'slow',
      kenBurns: 'slow',
      duration: 7500,
      parallax: false,
      scenes: [
        image('chapter5/image01'),
        image('chapter5/image02'),
        image('chapter5/image03'),
        image('chapter5/image04'),
        image('chapter5/image05', { duration: 10000 }), // final photo lingers
      ],
    },
  ],

  ending: {
    text: 'To be continued...',
    revealDelayMs: 1200,
    holdMs: 6500,
    fadeMs: 4000,
    replayLabel: 'Begin again',
  },
};