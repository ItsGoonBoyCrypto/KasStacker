// Tracks watched standards proposals (PRs) daily into data/proposals.json.
// Which PRs to watch lives in data/watched-proposals.json. Fails loudly.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const watched = JSON.parse(await readFile(join(root, 'data', 'watched-proposals.json'), 'utf8'));

const headers = { 'User-Agent': 'kasstacker-proposals', Accept: 'application/vnd.github+json' };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

const items = [];
for (const w of watched) {
  const res = await fetch(`https://api.github.com/repos/${w.repo}/pulls/${w.pr}`, { headers });
  if (!res.ok) throw new Error(`${w.repo}#${w.pr}: ${res.status}`);
  const pr = await res.json();
  items.push({
    label: w.label,
    note: w.note ?? null,
    url: pr.html_url,
    status: pr.merged ? 'merged' : pr.state, // merged | open | closed
    updated: pr.updated_at,
    reviewComments: pr.review_comments,
    commits: pr.commits,
  });
  console.log(`ok ${w.repo}#${w.pr} ${pr.merged ? 'MERGED' : pr.state} updated=${pr.updated_at}`);
}

await writeFile(
  join(root, 'data', 'proposals.json'),
  JSON.stringify({ generatedAt: new Date().toISOString(), items }, null, 2) + '\n',
);
console.log(`wrote data/proposals.json (${items.length} watched)`);
