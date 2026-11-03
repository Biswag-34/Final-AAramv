import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const input = process.argv[2];
if (!input) throw new Error('Usage: node scripts/generate-favicons.mjs <source-png>');
const source = await readFile(input);
const output = path.resolve('public');
const sizes = [16, 32, 48, 64, 96, 180, 192, 512];
const frames = new Map();
for (const size of sizes) {
  // Preserve the supplied square artwork, proportions and white background.
  const buffer = await sharp(source).resize(size, size, { fit: 'contain', background: '#ffffff', kernel: 'lanczos3' }).flatten({ background: '#ffffff' }).png().toBuffer();
  frames.set(size, buffer);
  await writeFile(path.join(output, size === 180 ? 'apple-touch-icon.png' : `favicon-${size}x${size}.png`), buffer);
}
// ICO directory followed by four lossless PNG frames (no added dependency).
const icoSizes = [16, 32, 48, 64];
const header = Buffer.alloc(6 + 16 * icoSizes.length);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(icoSizes.length, 4);
let offset = header.length;
for (const [i, size] of icoSizes.entries()) {
  const frame = frames.get(size), start = 6 + 16 * i;
  header[start] = size; header[start + 1] = size;
  header.writeUInt16LE(1, start + 4);
  header.writeUInt16LE(32, start + 6);
  header.writeUInt32LE(frame.length, start + 8);
  header.writeUInt32LE(offset, start + 12);
  offset += frame.length;
}
await writeFile(path.join(output, 'favicon.ico'), Buffer.concat([header, ...icoSizes.map(size => frames.get(size))]));
console.log('Created eight PNG icons and a four-frame ICO from the supplied emblem.');
