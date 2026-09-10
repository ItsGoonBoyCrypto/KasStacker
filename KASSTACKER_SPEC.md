# KasStacker — Site Spec v1

> **Amendments (v1.1, 2026-09-10, per Liam):** Igra L2 and KRC-20 are **out of scope for now**
> (Igra may return later if there's demand) — the stack is 5 components. Domain: **kasstacker.org**.
> Logo: Liam's hexagon blockDAG "K" mark (recreated as SVG in `src/components/Logo.astro` and
> `public/favicon.svg`); wordmark set in Chakra Petch. Sections below mentioning Igra/KRC-20
> describe the original 7-component plan.

**Name:** KasStacker
**Repo:** https://github.com/ItsGoonBoyCrypto/KasStacker
**Mission:** The go-to place to understand Kaspa's programmability stack — Kaspa Script/Covenants, Silverscript, Argent, KRC-20, KCC-20, vProgs, Igra L2 — what each piece does, how they fit together, and where to go to build.
**Derived from:** `KASPA_STACK_SITE_SPEC.md` (the Claude Code build spec). That doc's engine is kept; this spec changes the audience and the experience.

---

## 1. What changed vs the source spec, and why

The source spec builds a **developer docs site** (Starlight theme, sidebar, docs voice). Liam's brief is different: *"easy to use for everyday people who want to understand and learn more about what these things do and how they go together"* + *"top-level looking."*

So KasStacker is a **learning platform first, builder reference second**:

| Kept from source spec | Changed |
|---|---|
| Astro + TypeScript + pnpm + Cloudflare Pages | **Starlight dropped as the site shell** — plain Astro + MDX + Pagefind search. Starlight looks like docs and fights a custom design. (Cost: ~a day rebuilding search/nav; worth it.) |
| `components.json` / `matrix.json` / `status.json` data model | New **Learn** section — the everyday-person on-ramp, which the source spec doesn't have |
| `fetch-status.ts` + daily cron workflow | Component page template gets a mandatory **"In plain English"** block *above* the technical sections |
| ComparisonMatrix, MaturityBadge, DecisionGuide, StatusBoard, StackDiagram components | Stack diagram promoted from a docs page to the **homepage centerpiece** (interactive, clickable) |
| CI quality gates (§11 of source), `lastReviewed` staleness banners, sources-per-claim discipline | Glossary becomes **site-wide hover cards**, not just a page |
| Delivery order philosophy (deploy day one, ship in slices) | Visual identity: custom design system (below), not a docs theme |

Non-goals unchanged: no in-browser compiler (link kascov.io), no wallet integration, no on-chain reads, no auth, no unsourced maturity claims.

---

## 2. Audiences and the two front doors

1. **The curious** (holder, community member, journalist): wants to understand what "covenants on Kaspa" actually means, why Toccata mattered, what Igra is, KRC-20 vs KCC-20. Never opens a terminal. **→ Learn**
2. **The builder**: wants to pick a layer and ship. **→ Build** (the source spec's content, kept nearly verbatim)

Every page serves both via layered depth: plain language first, precision second, code last.

---

## 3. Information architecture

```
/                       Home — hero, interactive stack diagram, three doors, live status strip
/learn/                 The on-ramp (NEW — see §4)
  kaspa-in-60-seconds
  what-toccata-changed
  meet-the-stack        7 plain-language mini-explainers, one per component
  how-it-fits-together  scroll-through: one transaction's journey up the stack
  faq
/stack/<id>             7 component pages: kaspa-script, silverscript, argent,
                        krc-20, kcc-20, vprogs, igra-l2   (template §6)
/compare/               matrix + silverscript-vs-argent, krc20-vs-kcc20, l1-covenants-vs-igra
/decide/                “What should I use?” — 3-question guide (source spec §6 rules kept)
/build/                 setup, first-covenant, first-argent-app, testnet, examples
/status/                live repo status board (from status.json)
/glossary/              alphabetical; also powers site-wide hover cards
/changelog/             monthly “what moved”
```

URL change from source spec: component pages live at `/stack/...` not `/components/...` — reads better for the brand ("the stack" is the product).

---

## 4. Learn section (the differentiator)

Rules of voice, enforced everywhere but strictest here:

- **Three-layer explanations**: one-sentence version → analogy → precise version. Never precision first.
- **No unexplained jargon.** First use of any glossary term renders a hover card (tap on mobile).
- **One idea per screen.** Short sections, generous whitespace, a diagram or visual per concept.
- **Honesty rails carried over:** every maturity claim is sourced and dated; "What it can't do" stays mandatory on component pages.

Content plan:

1. **Kaspa in 60 seconds** — blockDAG, speed, PoW; why Kaspa was "money only" until 2026.
2. **What Toccata changed** — before/after graphic. Before: send/receive. After: chain-enforced rules (covenants), tokens with L1 settlement, ZK verification, an EVM L2 anchored to L1.
3. **Meet the stack** — 7 cards, each: emoji/icon, one-liner, analogy, "used for", maturity badge, link to full page. The analogies (draft, refine in build):
   - Kaspa Script + Covenants → *the vault door: rules built into the money itself*
   - Silverscript → *a language for writing those rules without wiring the door yourself*
   - Argent → *an app framework on top: many doors that work together*
   - KRC-20 → *the first token standard (indexer-based bookkeeping)*
   - KCC-20 → *tokens whose rules the chain itself enforces*
   - vProgs → *the roadmap: programs living natively in the DAG*
   - Igra L2 → *an Ethereum-style computer that settles to Kaspa*
4. **How it fits together** — scroll-driven walkthrough of one real flow (e.g. a vault deposit → covenant spend → what each layer did). Static-friendly (CSS scroll animations, no heavy JS).
5. **FAQ** — "Is this like Ethereum smart contracts?", "Is my KRC-20 token obsolete?", "What's audited?", "Where do I actually start?"

---

## 5. Visual design system

Goal: Stripe/Linear-grade polish, crypto-native without being degen. Dark-first, full light theme.

- **Ground (dark):** `#0A0F14` page, `#101820` cards, hairline borders `#1C2830`.
- **Accent:** Kaspa teal `#70C7BA` (⚠️ verify against kaspa.org press kit at build — inferred, not measured) plus a deeper interactive teal `#49EACB`-family for glows/links. Accent is used sparingly: links, active states, the diagram, badge tier "production".
- **Light theme:** warm off-white `#F7FAF9`, same teal, borders `#DCE7E4`.
- **Type:** display = Sora (headings, wordmark — geometric, confident, not the over-used Inter/Space Grotesk pairing); text = Instrument Sans; code = JetBrains Mono. All via fonts.googleapis.com with system fallbacks.
- **Motif:** *the stack* — horizontal layered bars. Appears in the logo (bars forming a "K"), section dividers, loading states, and the diagram itself. One motif everywhere = identity.
- **Maturity badge scale** (color-coded, consistent site-wide):
  `roadmap` grey · `experimental` amber · `testnet` blue · `pre-audit` orange · `audited` green · `production` teal · `legacy` muted/struck.
- **Cards over tables** for everyday-facing pages; the compare matrix keeps a real table (with horizontal scroll container on mobile).
- Performance budget: Lighthouse ≥ 95 perf/a11y on `/`, `/compare/`, one `/stack/` page (source spec gate, kept). No hero videos; inline SVG only.

### Homepage layout
1. **Hero:** wordmark + "Understand the Kaspa stack." + subline "What covenants, Silverscript, Argent, KCC-20 and Igra actually do — and how they fit together." Two CTAs: *Start the 5-minute tour* (→ /learn) and *I'm a builder* (→ /build).
2. **Interactive stack diagram** (§7 of source spec, kept: consensus → Script/Covenants → Silverscript → Argent → apps; Igra L2 side-column anchored to L1; vProgs dashed "roadmap"; KRC-20 greyed with migration arrow to KCC-20). Hover = one-liner tooltip; click = component page.
3. **Three doors:** Learn / Compare / Build cards.
4. **Live status strip:** per-component maturity badge + last-commit date from `status.json` ("Silverscript · v1.0.0 · updated 2d ago").
5. Footer: sources, community links, "built by" line, GitHub.

---

## 6. Component page template

Source spec §5 template kept, with one added mandatory block at the top and reordered for lay readers:

```mdx
---
title / componentId / lastReviewed / sources   (schema unchanged)
---
<ComponentHeader/>              # badge, links, lastReviewed, staleness banner

## In plain English               ← NEW, mandatory. 2–3 sentences + the analogy.
## What it is                     # the precise version
## What problem it solves
## What it can't do               # mandatory, non-empty (kept)
## Mental model                   # one diagram or analogy (kept)
## Minimal example                # ≤30 lines, verbatim from official source (kept)
## When to choose it over…        # one line per sibling → compare pages (kept)
## Maturity & risk                # status board data + prose, every claim dated (kept)
## Links
```

Frontmatter schema, `components.json`, `matrix.json`, `status.json`, and `fetch-status.ts` are exactly as in the source spec (§1, §3, and the workflows). One data note: `layer` enum, `maturity` enum, "leave unknown as `null`, never guess" — all kept verbatim.

---

## 7. Known-facts audit (do not copy the source spec's sample values)

The source spec's `components.json` example is **illustrative** and partly conflicts with what we've verified at source (2026-09-09):

- **Silverscript:** v1.0.0 released 2026-09-09; SECURITY.md still calls it experimental; **no audit named**. New in 1.0.0: `g16.verify` + `r0.succinct.poseidon2.verify` ZK verifiers lowering to KIP-16 `OpZkPrecompile`. Maturity = `pre-audit` at best; do not imply audited.
- **KIP-16 ZK opcodes:** live on mainnet since 2026-06-30 (verified).
- **Argent:** 3 repos, **no tags or releases**, self-described "not yet release-ready", pins Silverscript to the RC (`c7d17a1`) not 1.0.0. Maturity = `experimental`. Repo slug `argent-lang/argent` from the source spec is **unverified — confirm before it goes in components.json**.
- **Mass/limits content (build section):** post-Toccata the 100k standard-tx mass is gone; per-tx limits = per-dimension block limits (compute 500k / storage 500k / transient 1M). **Read rusty-kaspa master — the KIPs and docs are stale on this.**
- **KCC-20 spec location:** still unconfirmed (open item, below).
- All other sample values (dates, "testnet-12", stars, etc.): re-fetch at build, never copy.

---

## 8. Build plan (adapted delivery order — each step: commit, deploy, share preview URL)

0. Scaffold Astro + pnpm + Cloudflare Pages + deploy workflow. Live URL day one.
1. Design system (tokens, fonts, badges, layout shell, dark/light) + homepage hero + **StackDiagram**.
2. Data layer: `components.json` (verified values only) + `matrix.json` + ComparisonMatrix + MaturityBadge.
3. `fetch-status.ts` + daily workflow + StatusBoard + homepage status strip.
4. **Learn section** (all five pages) — the differentiator ships before the deep docs.
5. Component pages, order: silverscript, argent, kaspa-script, kcc-20, krc-20, igra-l2, vprogs.
6. Compare pages (3) + DecisionGuide.
7. Build section — test every command in a fresh container before committing (source spec rule, kept).
8. Glossary + hover cards, changelog, staleness banners, full CI gates (§11 of source spec, kept verbatim).

---

## 9. Open decisions for Liam (recommendations attached, none blocking steps 0–4)

1. **Domain** — recommend checking `kasstacker.com` / `kasstacker.io`; Cloudflare Pages subdomain fine for launch.
2. **Your own tools in `/build/examples`** — recommend **include, clearly labeled** "maintained by the site author": DagLock and DAGmate's escrow are among the only shipped mainnet covenant examples that exist. Scarcity makes them genuinely useful; the label preserves neutrality.
3. **KCC-20 spec location + draft version** — verify at build (kaspanet KIPs? the KCC20 book?). Never guess.
4. **Kasplex / other L2s** — recommend one "Other L2s" comparison row now, dedicated pages only if asked.
5. **Community links** — which Discord/Telegram/X handles the footer should carry.
