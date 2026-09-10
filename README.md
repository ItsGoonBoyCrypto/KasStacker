# KasStacker

**kasstacker.org** — the go-to place to understand Kaspa's programmability stack:
Kaspa Script + Covenants, Silverscript, Argent, KCC-20 and the vProgs roadmap.
Learning platform first, builder reference second. Complements
[docs.kaspa.org/toccata](https://docs.kaspa.org/toccata) and [kascov.io](https://kascov.io).

Full design spec: [`KASSTACKER_SPEC.md`](./KASSTACKER_SPEC.md).

## Stack

Astro 5 + TypeScript + pnpm, fully static, deployed to Cloudflare Pages.

```
data/components.json   canonical component registry — source of truth for matrix, cards, pages
data/matrix.json       which rows/columns the comparison matrix shows
data/status.json       generated — GitHub repo status, refreshed daily by CI; do not edit
scripts/fetch-status.mjs   the fetcher (fails loudly on any non-200)
src/pages/             home, /learn tour, /stack pages, /compare, /status
```

## Data rules

- Every value in `components.json` is verified or `null` — never guessed. `null` renders as **unverified**.
- Maturity claims are dated. "Audited" requires a named auditor.
- `status.json` is only ever written by `fetch-status.mjs`; the refresh workflow fails loudly rather than committing stale data.

## Develop

```bash
pnpm install
pnpm dev        # http://localhost:4321
pnpm check      # astro check + types
pnpm build      # static build to dist/
```

## Deploy

Hosted on the Hetzner box at 178.105.167.184 (same server as dagmate.org), nginx vhost
`deploy/nginx-kasstacker.conf` serving `/var/www/kasstacker`. Deploys run as the restricted
`kasstacker` user, which owns only that directory — never root.

- **CI:** every push to `main` builds and rsyncs `dist/` (needs repo secret
  `KASSTACKER_DEPLOY_KEY` — the private half of the key in the server's
  `/home/kasstacker/.ssh/authorized_keys`).
- **Manual:** `deploy/deploy.sh` does the same from a dev machine.
- `refresh-status.yml` re-fetches repo status daily at 06:00 UTC and redeploys when it changed.
- TLS: `certbot --nginx -d kasstacker.org -d www.kasstacker.org` once DNS points at the box.
