// Generates clean, professional app icons from the source emblem.
// - Trims the baked-in white square background
// - Flood-fills the EXTERIOR white to transparent (keeps the interior Texas map intact)
// - Produces a transparent logo mark + PWA / favicon / apple-touch icons on a clean light backdrop
//
// Run: node scripts/generate-icons.mjs
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const pub = path.join(root, 'public');
const icons = path.join(pub, 'icons');
fs.mkdirSync(icons, { recursive: true });

const SRC = path.join(pub, 'logo.png');

// Near-white test (catches anti-aliased edges too)
const isNearWhite = (r, g, b, a) => a > 8 && r > 234 && g > 234 && b > 234;

async function buildTransparentMark() {
  // 1. Trim the white padding to the emblem bounding box
  const trimmed = await sharp(SRC)
    .ensureAlpha()
    .trim({ threshold: 12 })
    .toBuffer();

  const { data, info } = await sharp(trimmed)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const idx = (x, y) => (y * width + x) * channels;

  // 2. Flood-fill exterior white -> transparent (BFS from every border pixel)
  const visited = new Uint8Array(width * height);
  const stack = [];
  const pushIf = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const p = y * width + x;
    if (visited[p]) return;
    const i = idx(x, y);
    if (isNearWhite(data[i], data[i + 1], data[i + 2], data[i + 3])) {
      visited[p] = 1;
      stack.push(x, y);
    }
  };
  for (let x = 0; x < width; x++) { pushIf(x, 0); pushIf(x, height - 1); }
  for (let y = 0; y < height; y++) { pushIf(0, y); pushIf(width - 1, y); }

  while (stack.length) {
    const y = stack.pop();
    const x = stack.pop();
    data[idx(x, y) + 3] = 0; // clear alpha
    pushIf(x + 1, y);
    pushIf(x - 1, y);
    pushIf(x, y + 1);
    pushIf(x, y - 1);
  }

  // 3. Soften remaining hard white halo one pixel in from transparent edges
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const p = y * width + x;
      if (visited[p]) continue;
      const i = idx(x, y);
      if (isNearWhite(data[i], data[i + 1], data[i + 2], data[i + 3])) {
        // white pixel adjacent to a cleared pixel -> feather
        const near =
          visited[p - 1] || visited[p + 1] || visited[p - width] || visited[p + width];
        if (near) data[i + 3] = Math.min(data[i + 3], 90);
      }
    }
  }

  const markBuf = await sharp(data, { raw: { width, height, channels } })
    .png()
    .toBuffer();

  // Square it (padded) so downstream compositing is predictable
  const size = Math.max(width, height);
  return sharp({
    create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: markBuf, gravity: 'center' }])
    .png()
    .toBuffer();
}

// Clean light backdrop (subtle depth, no visible "box"): matches the app's cream palette
function lightBg(size, radius) {
  const r = radius ?? Math.round(size * 0.22);
  return Buffer.from(
    `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#ffffff"/>
          <stop offset="1" stop-color="#EEF2F8"/>
        </linearGradient>
        <radialGradient id="v" cx="50%" cy="38%" r="72%">
          <stop offset="0" stop-color="#ffffff" stop-opacity="0"/>
          <stop offset="1" stop-color="#1E3A5F" stop-opacity="0.06"/>
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="${size}" height="${size}" rx="${r}" ry="${r}" fill="url(#g)"/>
      <rect x="0" y="0" width="${size}" height="${size}" rx="${r}" ry="${r}" fill="url(#v)"/>
    </svg>`
  );
}

// Full-bleed light backdrop for maskable (no rounding — OS applies the mask)
function lightBgFull(size) {
  return Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#ffffff"/>
          <stop offset="1" stop-color="#E9EEF6"/>
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#g)"/>
    </svg>`
  );
}

async function makeIcon(mark, { size, fraction, out, full = false, rounded = true }) {
  const bg = full ? lightBgFull(size) : rounded ? lightBg(size) : lightBgFull(size);
  const inner = Math.round(size * fraction);
  const markResized = await sharp(mark)
    .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  await sharp(bg)
    .png()
    .composite([{ input: markResized, gravity: 'center' }])
    .png()
    .toFile(out);
  console.log('  ✓', path.relative(root, out));
}

async function main() {
  console.log('Building transparent logo mark…');
  const mark = await buildTransparentMark();
  await sharp(mark).png().toFile(path.join(pub, 'logo-mark.png'));
  console.log('  ✓ public/logo-mark.png (transparent emblem)');

  console.log('Generating icons…');
  // Launcher icons (any): full-bleed light background, generous emblem
  await makeIcon(mark, { size: 192, fraction: 0.78, out: path.join(icons, 'icon-192.png'), full: true });
  await makeIcon(mark, { size: 512, fraction: 0.78, out: path.join(icons, 'icon-512.png'), full: true });
  // Maskable: full-bleed + safe-zone padding (emblem ~62%)
  await makeIcon(mark, { size: 512, fraction: 0.62, out: path.join(icons, 'icon-512-maskable.png'), full: true });
  // Apple touch (iOS rounds corners itself → full-bleed light bg)
  await makeIcon(mark, { size: 180, fraction: 0.74, out: path.join(icons, 'apple-touch-icon.png'), full: true });

  // Favicon: transparent emblem (clean on any browser tab background)
  await sharp(mark).resize(64, 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png().toFile(path.join(pub, 'favicon.png'));
  console.log('  ✓ public/favicon.png (transparent)');

  console.log('Done.');
}

main().catch((e) => { console.error(e); process.exit(1); });
