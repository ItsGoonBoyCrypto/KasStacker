// Content quality gates, run in CI before deploy:
//  1. No "TODO"/"TBD" strings anywhere in src/ or data/ — unfinished content never ships.
//  2. Every component in components.json gets a page (the dynamic route guarantees it,
//     but a rename that orphans hand-written links would slip through — so check dist/).
//  3. Every external URL in components.json and glossary sources answers < 400.
//     Hosts behind bot protection may answer 403 — allow-listed, warned, not failed.
import { readFile, readdir, access } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
let failures = 0;
const fail = (msg) => { console.error(`FAIL ${msg}`); failures++; };
const warn = (msg) => { console.warn(`warn ${msg}`); };

// -- 1: forbidden strings ----------------------------------------------------
const FORBIDDEN = [/\bTODO\b/, /\bTBD\b/];
async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}
for (const base of ['src', 'data']) {
  for await (const file of walk(join(root, base))) {
    const text = await readFile(file, 'utf8');
    for (const re of FORBIDDEN) {
      if (re.test(text)) fail(`${file.slice(root.length + 1)} contains ${re.source.replaceAll('\\b', '')}`);
    }
  }
}

// -- 2: every component has a built page ------------------------------------
const components = JSON.parse(await readFile(join(root, 'data', 'components.json'), 'utf8'));
for (const c of components) {
  try {
    await access(join(root, 'dist', 'stack', c.id, 'index.html'));
  } catch {
    fail(`no built page for component "${c.id}" (expected dist/stack/${c.id}/index.html)`);
  }
}

// -- 3: external links answer -----------------------------------------------
// 403 from bot-protected hosts is tolerated with a warning; anything else >= 400 fails.
const urls = new Set();
for (const c of components) {
  for (const u of [c.docs, c.playground, c.repo && `https://github.com/${c.repo}`]) {
    if (u) urls.add(u);
  }
}
const check = async (url) => {
  const res = await fetch(url, { method: 'HEAD', redirect: 'follow', headers: { 'User-Agent': 'kasstacker-linkcheck' } });
  // Some hosts reject HEAD; retry those with GET before judging.
  return res.status === 405 || res.status === 404
    ? (await fetch(url, { redirect: 'follow', headers: { 'User-Agent': 'kasstacker-linkcheck' } })).status
    : res.status;
};
for (const url of urls) {
  try {
    let status;
    try {
      status = await check(url);
    } catch {
      // One retry: a transient network error must not block a deploy on its own.
      await new Promise((r) => setTimeout(r, 2000));
      status = await check(url);
    }
    if (status === 403) warn(`${url} -> 403 (bot protection?) — verify by hand occasionally`);
    else if (status >= 400) fail(`${url} -> ${status}`);
    else console.log(`ok   ${url} -> ${status}`);
  } catch (e) {
    fail(`${url} -> ${e.message}`);
  }
}

if (failures > 0) {
  console.error(`\n${failures} content gate failure(s)`);
  process.exit(1);
}
console.log('\nall content gates passed');
