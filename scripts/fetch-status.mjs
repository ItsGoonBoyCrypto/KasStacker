// Fetches repo status from the GitHub API into data/status.json.
// Run by .github/workflows/refresh-status.yml daily; never fetched at runtime.
// Fails loudly on any non-200 so stale data is never silently committed.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const components = JSON.parse(await readFile(join(root, 'data', 'components.json'), 'utf8'));

const headers = { 'User-Agent': 'kasstacker-status', Accept: 'application/vnd.github+json' };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

async function gh(path) {
  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (!res.ok) throw new Error(`GitHub API ${res.status} for ${path}`);
  return res.json();
}

const repos = {};
for (const c of components) {
  if (!c.repo) continue;
  const [meta, tags] = await Promise.all([
    gh(`/repos/${c.repo}`),
    gh(`/repos/${c.repo}/tags?per_page=1`),
  ]);
  let latestTag = null;
  let latestTagDate = null;
  if (tags.length > 0) {
    latestTag = tags[0].name;
    const commit = await gh(`/repos/${c.repo}/commits/${tags[0].commit.sha}`);
    latestTagDate = commit.commit.committer.date;
  }
  repos[c.repo] = {
    latestTag,
    latestTagDate,
    lastCommit: meta.pushed_at,
    openIssues: meta.open_issues_count,
    stars: meta.stargazers_count,
    archived: meta.archived,
  };
  console.log(`ok ${c.repo} tag=${latestTag ?? '-'} pushed=${meta.pushed_at}`);
}

const out = { generatedAt: new Date().toISOString(), repos };
await writeFile(join(root, 'data', 'status.json'), JSON.stringify(out, null, 2) + '\n');
console.log(`wrote data/status.json (${Object.keys(repos).length} repos)`);
