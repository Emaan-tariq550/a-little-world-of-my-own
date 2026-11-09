import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { story } from '../src/config/storyConfig.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pub = path.join(root, 'public');

// every file the story expects
function collect() {
  const out = [];
  story.chapters.forEach((ch) => {
    ch.scenes.forEach((s, i) => {
      const label = `${ch.id} scene ${i + 1}`;
      if (s.type === 'image') out.push({ label, src: s.src });
      if (s.type === 'pair') s.items.forEach((it) => out.push({ label, src: it.src }));
      if (s.type === 'video') (s.sources ?? [{ src: s.src }]).forEach((v) => out.push({ label, src: v.src }));
    });
  });
  story.music.sources.forEach((m) => out.push({ label: 'music', src: m.src }));
  return out;
}

// every file that actually exists in public/assets
function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) walk(full, acc);
    else acc.push(full);
  }
  return acc;
}

const actual = walk(path.join(pub, 'assets')).map(
  (f) => '/' + path.relative(pub, f).split(path.sep).join('/')
);
const lowerMap = new Map(actual.map((f) => [f.toLowerCase(), f]));

let missing = 0;
let ok = 0;

collect().forEach(({ label, src }) => {
  if (actual.includes(src)) {
    ok += 1;
    return;
  }
  missing += 1;
  const hint = lowerMap.get(src.toLowerCase());
  console.log(`MISSING  [${label}]  ${src}`);
  if (hint) console.log(`         -> file maujood hai par naam/case alag hai: ${hint}`);
});

console.log(`\n${ok} files found, ${missing} missing`);
if (!actual.length) console.log('public/assets/ khali hai ya folder galat jagah hai.');
process.exit(missing ? 1 : 0);