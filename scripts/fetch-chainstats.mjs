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

const getKascov = async (path) => {
  const res = await fetch(`https://kascov.io${path}`, { headers: { 'User-Agent': 'kasstacker-stats' } });
  if (!res.ok) throw new Error(`kascov.io ${path}: ${res.status}`);
  return res.json();
};

const [stats, series, kascovTpl] = await Promise.all([
  get('/v1/stats'),
  get('/v1/stats/timeseries?range=30d'),
  getKascov('/data/mainnet/templates.json'),
]);

const kind = (k) => stats.events_by_kind?.find((e) => e.kind === k)?.count ?? null;
const tokenTpl = stats.utxos_by_template?.find((t) => t.template === 'KCC20 token');
// Second, independent indexer (kascov) — per the STP-KAS review: one source
// is a single point of quiet failure. Units differ from kcc20.info (kascov
// counts token STATES, kcc20.info counts tokens) — pages must say which.
const kt = (name) => kascovTpl.templates?.filter((t) => t.name.includes(name)) ?? [];
const sum = (arr, f) => arr.reduce((a, t) => a + (t[f] ?? 0), 0);
const kasware = kt('KasWare');
const kcc20K = kt('KCC20')[0] ?? null;
const p2sh = kt('p2sh commitment')[0] ?? null;
const escrow = kt('SilverScript')[0] ?? null;
const out = {
  generatedAt: new Date().toISOString(),
  source: 'https://kcc20.info/v1/stats',
  totals: {
    covenantsCreated: kind('genesis'),
    transitions: kind('transition'),
    burns: kind('burn'),
    // Alive now = genesis − burns; the honest headline. The all-time count is
    // dominated by KasWare vault create/burn cycles.
    alive: kind('genesis') != null && kind('burn') != null ? kind('genesis') - kind('burn') : null,
  },
  tokens: {
    live: tokenTpl?.live ?? null,
    total: tokenTpl?.count ?? null,
  },
  // What the all-time number actually is, by template (kascov splits the
  // KasWare vault families; kcc20.info lumps them under p2sh commitment).
  kascov: {
    source: 'https://kascov.io/data/mainnet/templates.json',
    generatedAtMs: kascovTpl.generated_at_ms ?? null,
    // `covenants` counts covenant instances (sums ≈ the genesis total);
    // `liveStates` counts live UTXO states — different units, label both.
    templates: {
      kaswareVaults: { covenants: sum(kasware, 'covenants'), liveStates: sum(kasware, 'live_states') },
      kcc20: kcc20K ? { covenants: kcc20K.covenants, liveStates: kcc20K.live_states, statesEver: kcc20K.ever_seen } : null,
      p2shCommitment: p2sh ? { covenants: p2sh.covenants, liveStates: p2sh.live_states } : null,
      silverscriptEscrow: escrow ? { covenants: escrow.covenants, liveStates: escrow.live_states } : null,
      totalCovenants: sum(kascovTpl.templates ?? [], 'covenants'),
      totalLiveStates: sum(kascovTpl.templates ?? [], 'live_states'),
    },
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
