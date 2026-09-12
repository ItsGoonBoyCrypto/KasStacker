// Pulls covenant adoption stats from kcc20.info (keyless) into
// data/chainstats.json at build/refresh time — never at runtime.
// Fails loudly so stale numbers are never silently committed.
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const get = async (path) => {
  const res = await fetch(`https://kcc20.info${path}`, { headers: { 'User-Agent': 'kasstacker-stats' } });
  if (!res.ok) throw new Error(`kcc20.info ${path}: ${res.status}`);
  return res.json();
};

const [stats, series] = await Promise.all([get('/v1/stats'), get('/v1/stats/timeseries?range=30d')]);

const kind = (k) => stats.events_by_kind?.find((e) => e.kind === k)?.count ?? null;
const tokenTpl = stats.utxos_by_template?.find((t) => t.template === 'KCC20 token');
const out = {
  generatedAt: new Date().toISOString(),
  source: 'https://kcc20.info/v1/stats',
  totals: {
    covenantsCreated: kind('genesis'),
    transitions: kind('transition'),
    burns: kind('burn'),
  },
  tokens: {
    live: tokenTpl?.live ?? null,
    total: tokenTpl?.count ?? null,
  },
  series: {
    range: series.range,
    bucketSeconds: series.bucket_seconds,
    points: (series.points ?? []).map((p) => ({
      t: p.timestamp,
      events: p.covenant_events,
      actions: p.token_actions,
    })),
  },
};
if (!out.totals.covenantsCreated) throw new Error('no genesis count — refusing to write empty stats');
await writeFile(join(root, 'data', 'chainstats.json'), JSON.stringify(out, null, 2) + '\n');
console.log(`wrote data/chainstats.json — ${out.totals.covenantsCreated} covenants created, ${out.series.points.length} buckets (${out.series.range})`);
