// Renders each cheat-sheet PDF (public/sheets/*.pdf) to web images:
// <name>.webp (1600w) + <name>-sm.webp (800w) in public/sheets/img/.
// Run once when sheets change; outputs are committed.
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from '@napi-rs/canvas';
import sharp from 'sharp';
import { readFile, readdir, mkdir } from 'node:fs/promises';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(root, 'public', 'sheets');
const OUT = join(SRC, 'img');
await mkdir(OUT, { recursive: true });

for (const f of (await readdir(SRC)).filter((f) => f.endsWith('.pdf'))) {
  const data = new Uint8Array(await readFile(join(SRC, f)));
  const doc = await getDocument({ data }).promise;
  const page = await doc.getPage(1);
  const scale = 2200 / page.getViewport({ scale: 1 }).width;
  const vp = page.getViewport({ scale });
  const canvas = createCanvas(Math.round(vp.width), Math.round(vp.height));
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, viewport: vp }).promise;
  const png = canvas.toBuffer('image/png');
  const name = basename(f, '.pdf');
  // Trim the PDF page's white margins, then breathe: an even border back on.
  const trimmed = await sharp(
    await sharp(png).trim({ threshold: 12 }).png().toBuffer(),
  ).extend({ top: 56, bottom: 56, left: 56, right: 56, background: '#ffffff' }).png().toBuffer();
  const big = await sharp(trimmed).resize(1600).webp({ quality: 86 }).toFile(join(OUT, `${name}.webp`));
  const sm = await sharp(trimmed).resize(800).webp({ quality: 84 }).toFile(join(OUT, `${name}-sm.webp`));
  console.log(`${name}: ${canvas.width}x${canvas.height} -> ${(big.size / 1024).toFixed(0)}KB + ${(sm.size / 1024).toFixed(0)}KB`);
}
console.log('done');
