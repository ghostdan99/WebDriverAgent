// Generates the abstract placeholder artwork in public/media.
//
// These files exist only so the page can be previewed without real media. Replace them with
// the creator's own (or properly licensed) images before going live. Locked previews should
// always be low-resolution, pre-blurred thumbnails: never publish the full-size originals.
import {mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const OUT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public/media');

const PALETTES = [
  {bg: ['#f6e8ee', '#e6d8e8'], tones: ['#e58aa8', '#b496d8', '#c77a9c', '#f5c2a4']},
  {bg: ['#eee7f6', '#ddd3ec'], tones: ['#a98bd6', '#ee9fb7', '#8a74c0', '#f7d3bf']},
  {bg: ['#f9ece5', '#ecd9d3'], tones: ['#f2ad8c', '#de7f98', '#b27a97', '#f9dcc8']},
  {bg: ['#eaeef7', '#d9dfee'], tones: ['#93a3d6', '#e396b3', '#7d8bc2', '#f1cfd6']},
];

function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const r1 = (n) => Math.round(n * 10) / 10;

/** A soft, out-of-focus scene: a few light sources plus a vague upright shape. */
function blurredScene(seed, {width = 400, height = 500} = {}) {
  const rand = rng(seed);
  const palette = PALETTES[seed % PALETTES.length];
  const pick = () => palette.tones[Math.floor(rand() * palette.tones.length)];
  const blobs = [];
  for (let i = 0; i < 4; i++) {
    blobs.push(
      `<ellipse cx="${r1(rand() * width)}" cy="${r1(rand() * height)}" rx="${r1(60 + rand() * 120)}" ry="${r1(60 + rand() * 140)}" fill="${pick()}" opacity="${r1(0.35 + rand() * 0.4)}"/>`,
    );
  }
  const fx = width * (0.32 + rand() * 0.36);
  const figure = [
    `<ellipse cx="${r1(fx)}" cy="${r1(height * 0.36)}" rx="${r1(width * 0.11)}" ry="${r1(height * 0.1)}" fill="${palette.tones[2]}" opacity="0.85"/>`,
    `<ellipse cx="${r1(fx)}" cy="${r1(height * 0.78)}" rx="${r1(width * 0.24)}" ry="${r1(height * 0.34)}" fill="${palette.tones[1]}" opacity="0.7"/>`,
  ].join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice">
<defs>
<linearGradient id="g" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stop-color="${palette.bg[0]}"/><stop offset="1" stop-color="${palette.bg[1]}"/></linearGradient>
<filter id="b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="34"/></filter>
</defs>
<rect width="${width}" height="${height}" fill="url(#g)"/>
<g filter="url(#b)">${blobs.join('')}${figure}</g>
</svg>
`;
}

function cover() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 640" width="1600" height="640" preserveAspectRatio="xMidYMid slice">
<defs>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4e6ee"/><stop offset="0.55" stop-color="#ece2f2"/><stop offset="1" stop-color="#fbece4"/></linearGradient>
<radialGradient id="rose" cx="0.78" cy="0.3" r="0.55"><stop offset="0" stop-color="#ec8fb0" stop-opacity="0.7"/><stop offset="1" stop-color="#ec8fb0" stop-opacity="0"/></radialGradient>
<radialGradient id="plum" cx="0.18" cy="0.85" r="0.6"><stop offset="0" stop-color="#a888dc" stop-opacity="0.55"/><stop offset="1" stop-color="#a888dc" stop-opacity="0"/></radialGradient>
<radialGradient id="amber" cx="0.55" cy="0.05" r="0.35"><stop offset="0" stop-color="#f5c09d" stop-opacity="0.6"/><stop offset="1" stop-color="#f5c09d" stop-opacity="0"/></radialGradient>
<filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="22"/></filter>
<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.2  0 0 0 0 0.1  0 0 0 0 0.2  0 0 0 0.05 0"/></filter>
</defs>
<rect width="1600" height="640" fill="url(#bg)"/>
<rect width="1600" height="640" fill="url(#plum)"/>
<rect width="1600" height="640" fill="url(#rose)"/>
<rect width="1600" height="640" fill="url(#amber)"/>
<g filter="url(#soft)" opacity="0.5">
<polygon points="980,-40 1120,-40 760,700 600,700" fill="#ffffff" opacity="0.45"/>
<polygon points="1180,-40 1260,-40 980,700 880,700" fill="#ffffff" opacity="0.3"/>
</g>
<path d="M0 520 C 320 460 560 600 900 540 S 1400 470 1600 520 L1600 640 L0 640 Z" fill="#ffffff" opacity="0.35"/>
<rect width="1600" height="640" filter="url(#grain)"/>
</svg>
`;
}

function avatar() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" width="320" height="320">
<defs>
<radialGradient id="a" cx="0.3" cy="0.25" r="0.9"><stop offset="0" stop-color="#f0a7bd"/><stop offset="0.5" stop-color="#b8648a"/><stop offset="1" stop-color="#4c2f5e"/></radialGradient>
</defs>
<rect width="320" height="320" fill="url(#a)"/>
<text x="160" y="199" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="600" font-size="112" fill="#fff7f9" letter-spacing="-2">AV</text>
</svg>
`;
}

async function main() {
  await mkdir(OUT_DIR, {recursive: true});
  const files = {
    'cover.svg': cover(),
    'avatar.svg': avatar(),
  };
  for (let i = 1; i <= 6; i++) {
    files[`post-${String(i).padStart(2, '0')}.svg`] = blurredScene(100 + i);
  }
  for (let i = 1; i <= 9; i++) {
    files[`photo-${String(i).padStart(2, '0')}.svg`] = blurredScene(200 + i);
  }
  for (let i = 1; i <= 6; i++) {
    files[`video-${String(i).padStart(2, '0')}.svg`] = blurredScene(300 + i);
  }
  await Promise.all(
    Object.entries(files).map(([name, svg]) => writeFile(path.join(OUT_DIR, name), svg)),
  );
  console.log(`Wrote ${Object.keys(files).length} placeholder files to ${OUT_DIR}`);
}

await main();
