// Renders /internal/og-card to public/og.png at exactly 1200x630 using the
// system Chrome, so the card carries the site's real fonts. Run with the
// preview or dev server up:  node scripts/render-og.mjs [baseUrl]
import puppeteer from 'puppeteer-core';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';

const base = process.argv[2] ?? 'http://localhost:4321';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'public', 'og.png');

const chromePaths = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium-browser',
];
const executablePath = chromePaths.find((p) => existsSync(p));
if (!executablePath) throw new Error('no Chrome found');

const browser = await puppeteer.launch({ executablePath, headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
await page.goto(`${base}/internal/og-card/`, { waitUntil: 'networkidle0' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: out, type: 'png' });
await browser.close();
console.log(`wrote ${out}`);
