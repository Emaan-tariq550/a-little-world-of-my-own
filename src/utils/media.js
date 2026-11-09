const MIME = {
  mp4: 'video/mp4',
  m4v: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
};

export function getSources(scene) {
  const list = scene.sources ?? [{ src: scene.src }];
  return list.map((s) => ({
    src: s.src,
    type: s.type ?? MIME[s.src.split('?')[0].split('.').pop().toLowerCase()],
  }));
}

let probe;

// only formats this browser claims it can play (handles unsupported media)
export function getPlayableSources(scene) {
  const all = getSources(scene);
  if (typeof document === 'undefined') return all;
  probe ??= document.createElement('video');
  return all.filter((s) => !s.type || probe.canPlayType(s.type) !== '');
}

const seen = new Set();

export function preloadImage(src) {
  if (!src || seen.has(src)) return;
  seen.add(src);
  const img = new Image();
  img.decoding = 'async';
  img.src = src;
}

export function preloadScene(scene) {
  if (!scene) return;
  if (scene.type === 'image') preloadImage(scene.src);
  if (scene.type === 'pair') scene.items.forEach((i) => preloadImage(i.src));
  if (scene.type === 'video') {
    const [first] = getSources(scene);
    if (!first || seen.has(first.src)) return;
    seen.add(first.src);
    const v = document.createElement('video');
    v.preload = 'metadata'; // metadata only, never buffer whole videos
    v.muted = true;
    v.src = first.src;
  }
}