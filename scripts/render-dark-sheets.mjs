// Prints each dark cheat-sheet section from the built /learn/cheat-sheets
// page to its own PDF (public/sheets/dark/<slug>-dark.pdf) via headless
// Chrome, so the dark PDFs match the site pixel-for-pixel.
// Requires a server for the CURRENT build: node scripts/render-dark-sheets.mjs [baseUrl]
import puppeteer from 'puppeteer-core';
import { mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';

const base = process.argv[2] ?? 'http://localhost:4323';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(root, 'public', 'sheets', 'dark');
await mkdir(OUT, { recursive: true });

const chrome = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
].find((p) => existsSync(p));
if (!chrome) throw new Error('no chrome');

const SLUGS = ['the-stack', 'move-vs-enforce', 'what-is-a-covenant', 'three-things', 'which-tool'];
const FILE = {
  'the-stack': 'the-stack',
  'move-vs-enforce': 'move-vs-enforce',
  'what-is-a-covenant': 'what-is-a-covenant',
  'three-things': 'three-things-you-can-build',
  'which-tool': 'which-tool',
};

const browser = await puppeteer.launch({ executablePath: chrome, headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1160, height: 900, deviceScaleFactor: 2 });
// Chrome's print pipeline defaults to light color-scheme — force the site's dark
// theme and screen styles into the PDF render.
await page.emulateMediaType('screen');
await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
await page.goto(`${base}/learn/cheat-sheets/`, { waitUntil: 'networkidle0' });
await page.evaluate(() => document.fonts.ready);

for (const slug of SLUGS) {
  const h = await page.evaluate((s) => {
    // Isolate one sheet: hide chrome + siblings, keep header row without the PDF pill.
    document.querySelectorAll('.site-header, .site-footer, .head, .after, #search-dlg').forEach((el) => { el.style.display = 'none'; });
    document.querySelectorAll('.cs').forEach((el) => { el.style.display = el.id === s ? 'block' : 'none'; });
    const sec = document.getElementById(s);
    sec.querySelectorAll('.pdfs').forEach((el) => { el.style.display = 'none'; });
    sec.style.margin = '0';
    document.body.style.background = '#0A0F14';
    const main = document.querySelector('main');
    main.style.padding = '28px 0';
    window.scrollTo(0, 0);
    return Math.ceil(main.getBoundingClientRect().height);
  }, slug);
  await page.pdf({
    path: join(OUT, `${FILE[slug]}-dark.pdf`),
    width: '1160px',
    height: `${h}px`,
    printBackground: true,
    pageRanges: '1',
  });
  // restore for next iteration
  await page.reload({ waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);
  console.log(`${FILE[slug]}-dark.pdf (${h}px)`);
}
await browser.close();
console.log('done');
