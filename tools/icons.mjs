// Generates the app icons as PNG with no dependencies: teal ground, white pulse trace.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const BG = [0x0E, 0x7C, 0x86];
const FG = [0xFF, 0xFF, 0xFF];
// normalized pulse polyline (x, y), y down
const TRACE = [[0.08, 0.56], [0.28, 0.56], [0.35, 0.41], [0.44, 0.79], [0.53, 0.19], [0.61, 0.69], [0.68, 0.56], [0.92, 0.56]];

function crc32(buf) {
  let c, crc = 0xFFFFFFFF;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xFF;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function png(width, height, rgba) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) { raw[y * (width * 4 + 1)] = 0; rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4); }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4); ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}
function segDist(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay; const l2 = dx * dx + dy * dy;
  let t = l2 ? ((px - ax) * dx + (py - ay) * dy) / l2 : 0; t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}
export function renderIcon(size, { pad = 0, radius = 0 } = {}) {
  const buf = Buffer.alloc(size * size * 4);
  const inner = size * (1 - 2 * pad);
  const off = size * pad;
  const pts = TRACE.map(([x, y]) => [off + x * inner, off + y * inner]);
  const thick = inner * 0.075;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const i = (y * size + x) * 4;
    // rounded-square alpha for non-maskable variants
    let a = 1;
    if (radius > 0) {
      const rx = Math.max(0, Math.abs(x + 0.5 - size / 2) - (size / 2 - radius));
      const ry = Math.max(0, Math.abs(y + 0.5 - size / 2) - (size / 2 - radius));
      const d = Math.hypot(rx, ry) - radius; a = Math.max(0, Math.min(1, 0.5 - d));
    }
    let dmin = Infinity;
    for (let s = 1; s < pts.length; s++) dmin = Math.min(dmin, segDist(x + 0.5, y + 0.5, pts[s - 1][0], pts[s - 1][1], pts[s][0], pts[s][1]));
    const cov = Math.max(0, Math.min(1, thick / 2 + 0.5 - dmin));
    buf[i] = Math.round(BG[0] + (FG[0] - BG[0]) * cov);
    buf[i + 1] = Math.round(BG[1] + (FG[1] - BG[1]) * cov);
    buf[i + 2] = Math.round(BG[2] + (FG[2] - BG[2]) * cov);
    buf[i + 3] = Math.round(255 * a);
  }
  return png(size, size, buf);
}
export function writeIcons(dir) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'icon-180.png'), renderIcon(180));
  fs.writeFileSync(path.join(dir, 'icon-192.png'), renderIcon(192, { radius: 36 }));
  fs.writeFileSync(path.join(dir, 'icon-512.png'), renderIcon(512, { radius: 96 }));
  fs.writeFileSync(path.join(dir, 'icon-512-maskable.png'), renderIcon(512, { pad: 0.1 }));
  const svgPts = TRACE.map(([x, y]) => (x * 100).toFixed(1) + ',' + (y * 100).toFixed(1)).join(' ');
  fs.writeFileSync(path.join(dir, 'favicon.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#0E7C86"/><polyline points="${svgPts}" fill="none" stroke="#fff" stroke-width="7.5" stroke-linejoin="round" stroke-linecap="round"/></svg>\n`);
}
