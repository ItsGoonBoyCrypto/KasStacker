# KasStacker — ecosystem listing checklist

How an entry gets onto kasstacker.org/ecosystem, and what its check badges mean.
Nothing is listed for payment, ever. Verification is the only bar.

## Check types

Every card carries one or more of these, each with the date it was performed.
They live in `data/ecosystem.json` as a `checks` array.

| Badge | Type | What was actually done |
| --- | --- | --- |
| ⚙ compiled in CI | `compile` | The project's published contract code is cloned and compiled/parse-checked against the current toolchain by this repo's scheduled CI. A failure turns the listing red. |
| ⛓ on-chain proof | `onchain` | Transactions or covenant templates attributable to the project were verified on chain (mainnet or testnet-10 — the card says which). |
| 📂 source public | `source` | The project's stated source repository resolves publicly. This is existence, not an audit. |
| 👁 homepage visited | `homepage` | The live site was opened and its claims read. This is the weakest check. |

A card whose **only** check is `homepage` renders **"listed, not verified"** — it is
directory information, not proof.

## The bar for listing

1. Public code, or proof anyone can check on chain — no "trust us" entries.
2. It must show the stack doing something real.
3. Origin labelled: official or community.
4. Unknown facts render as "unverified" — never guessed.
5. Projects that fail a re-check move to the public under-review list with the reason stated.

## Re-checking cadence

- `compile` checks re-run **daily** in scheduled CI.
- Repo liveness (tags, pushes) refreshes **daily** from the GitHub API.
- Chain stats refresh **daily** from two independent indexers (kcc20.info + kascov.io).
- `homepage` and `onchain` checks carry their date; they are point-in-time.

## Suggesting an entry

Open an issue on this repository with the project's URL, its public code or an
on-chain proof anyone can follow, and what it demonstrates about the stack.
