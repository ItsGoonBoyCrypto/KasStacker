// Pulls a few real, recent covenant token actions from kcc20.info (keyless,
// read-only) into data/exhibits.json at build/refresh time — never at runtime.
// Fails loudly so a stale or broken feed is never silently committed.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const res = await fetch('https://kcc20.info/v1/kcc/activity?limit=25', {
  headers: { 'User-Agent': 'kasstacker-exhibits' },
});
if (!res.ok) throw new Error(`kcc20.info activity: ${res.status}`);
const { transactions } = await res.json();

const wanted = new Set(['buy', 'sell', 'transfer', 'mint', 'launch']);
const items = [];
const seenTickers = new Set();
for (const t of transactions ?? []) {
  if (!wanted.has(t.kind) || !t.ticker || !t.tx_id) continue;
  if (seenTickers.has(t.ticker)) continue; // variety over volume
  seenTickers.add(t.ticker);
  items.push({
    txId: t.tx_id,
    kind: t.kind,
    ticker: t.ticker,
    name: t.display_name || t.name || t.ticker,
    amount: t.amount,
    decimals: t.decimals ?? 0,
    timestamp: t.timestamp,
  });
  if (items.length === 3) break;
}
if (items.length === 0) throw new Error('no usable activity rows — refusing to write an empty exhibit set');

const out = { generatedAt: new Date().toISOString(), source: 'https://kcc20.info/v1/kcc/activity', items };
await writeFile(join(root, 'data', 'exhibits.json'), JSON.stringify(out, null, 2) + '\n');
console.log(`wrote data/exhibits.json (${items.length} exhibits: ${items.map((i) => `${i.kind} ${i.ticker}`).join(', ')})`);
