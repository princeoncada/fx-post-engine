# AI Handoff — FX Post Engine

**Version:** 1.0.0-stable  
**Phase:** Phase 1.0 — Documentation Baseline  
**Status:** stable  
**Last updated:** 2026-05-24  

---

## What This App Does

FX Post Engine is a **local-only operator dashboard** for ALSHIZAMIN Money Changer, Davao City. On demand, the operator clicks one button and the app:

1. Fetches today's FX rates from Frankfurter.dev (14 currencies vs PHP)
2. Fetches the previous trading day's rates for comparison
3. Calculates % change for each currency, ranks by absolute movement
4. Renders the top 3 movers as individual 1080×1080 PNG card images via Playwright
5. Displays the cards + a pre-generated ALSHIZAMIN-branded caption for review
6. On operator approval, uploads the 3 cards + caption to the ALSHIZAMIN Facebook Page via Graph API

The app is **never deployed to production**. It runs locally. API routes block execution on Vercel (`VERCEL === "1"` check).

---

## Architecture Summary

```
lib/fx/              — Data layer (fetch, calculate, orchestrate, date, caption, screenshot)
lib/facebook/        — Integration layer (Graph API)
components/          — Visual templates (FxMoverCard 1080×1080, FxPostTemplate 1080×1350)
app/page.tsx         — Operator dashboard UI
app/fx-card/         — Playwright screenshot target route
app/api/             — generate-fx-post (GET) and post-facebook (POST)
docs/                — Operational memory (this system)
```

**External dependencies:**
- `https://api.frankfurter.dev/v1/` — FX rate data
- `https://graph.facebook.com/` — Facebook publishing
- Playwright Chromium — card rendering

**Environment variables required:**
- `META_PAGE_ID` — ALSHIZAMIN Facebook Page ID
- `META_PAGE_ACCESS_TOKEN` — Page access token (long-lived)
- `META_GRAPH_VERSION` — e.g. `v25.0` (defaults to `v25.0` if not set)
- `NEXT_PUBLIC_BASE_URL` — e.g. `http://localhost:3000` (for Playwright navigation)

---

## Current Phase Status

**Phase 1.0 — Documentation Baseline** is complete.

All operational docs have been established:
- `CLAUDE.md` — Project rules, Implementation Gate, Session Protocol
- `docs/VERSIONING.md` — Version state machine
- `docs/WORKFLOW.md` — Phase cycle and validation commands
- `docs/AI_HANDOFF.md` — This file
- `docs/PHASE_LOG.md` — Full version history
- `docs/FUTURE_PLANS.md` — Planned phases
- `docs/DECISIONS.md` — Architecture decision records
- `docs/BRAND_GUIDE.md` — ALSHIZAMIN brand identity
- `docs/CONTENT_PHILOSOPHY.md` — Data vs. template ownership
- `docs/TEMPLATE_GUIDE.md` — Card template specifications
- `docs/API_GUIDE.md` — Frankfurter.dev + Facebook Graph API details
- `docs/PAGE_CONSTITUTION.md` — ALSHIZAMIN mission and principles
- `docs/NEW_CHATHEAD_OPENER.md` — Session start template
- `master_prompt.md` — Full Codex bootstrap document

**One manual step required:** Update `package.json` version from `0.1.0` → `1.0.0`.

---

## Next Phase

**Phase 1.1.0 — Standalone Generation Script**

Goal: Create `scripts/generate-and-post.ts` — a standalone Node.js script that runs the full generate + post workflow without requiring the Next.js dev server. This makes automated scheduling (cron, GitHub Actions, Task Scheduler) possible.

Key changes:
- `scripts/generate-and-post.ts` — new entry point calling lib/fx/ and lib/facebook/ directly
- `scripts/load-env.ts` — dotenv loader for the standalone context
- `package.json` `"scripts"` — add `"post:fx"` shortcut
- `tsconfig.scripts.json` — TypeScript config for the scripts/ folder

See `docs/FUTURE_PLANS.md` for full phase plan.

---

## Phase History (Abbreviated)

| Version       | Date       | Status  | Description                        |
|--------------|------------|---------|------------------------------------|
| 0.1.0        | 2026-05-01 | alpha   | Initial working build (pre-docs)   |
| 1.0.0-stable | 2026-05-24 | stable  | Documentation baseline established |

Full history in `docs/PHASE_LOG.md`.
