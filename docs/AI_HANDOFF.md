# AI Handoff - FX Post Engine

**Version:** 1.0.1-stable
**Phase:** Phase 1.0.1 - Documentation Hardening
**Status:** stable
**Last updated:** 2026-05-28

---

## What This App Does

FX Post Engine is a local-only operator dashboard for ALSHIZAMIN Money Changer, Davao City. On demand, the operator can:

1. Fetch current FX rates from Frankfurter.dev for 14 currencies vs PHP.
2. Fetch the previous distinct trading day's rates for comparison.
3. Calculate percent change for each currency and rank by absolute movement.
4. Render the top 3 movers as individual 1080x1080 PNG cards via Playwright.
5. Display the cards and ALSHIZAMIN-branded caption for review.
6. Upload the 3 cards and caption to the ALSHIZAMIN Facebook Page via Graph API.

The app is never deployed to production for generate/post behavior. It runs locally. API routes block execution on Vercel with the `VERCEL === "1"` check.

---

## Architecture Summary

```text
lib/fx/              Data layer: fetch, calculate, orchestrate, date, caption, screenshot
lib/facebook/        Facebook Graph API integration layer
components/          Visual templates
app/page.tsx         Operator dashboard UI
app/fx-card/         Playwright screenshot target route
app/api/             generate-fx-post and post-facebook API routes
docs/                Operational memory
```

**External dependencies:**
- `https://api.frankfurter.dev/v1/` - FX rate data
- `https://graph.facebook.com/` - Facebook publishing
- Playwright Chromium - card rendering

**Environment variables required:**
- `META_PAGE_ID` - ALSHIZAMIN Facebook Page ID
- `META_PAGE_ACCESS_TOKEN` - Page access token
- `META_GRAPH_VERSION` - Graph API version, defaults to `v25.0`
- `NEXT_PUBLIC_BASE_URL` - local Playwright navigation base URL

---

## Current Phase Status

**Phase 1.0.1 - Documentation Hardening** is complete.

This patch records and hardens the planning changes made after the Phase 1.0 documentation baseline:

- Future automation plans now include a standalone runner, local Next.js server startup/reuse, Windows Task Scheduler setup, dry-run mode, human-readable logs, and a structured duplicate-prevention ledger.
- Every repository change must be documented through versioning, regardless of size.
- Claude Code remains the default planner, prompt provider, reviewer, and validator.
- Codex remains the default implementer.
- Either tool may act as fallback implementer or validator only with explicit user approval or a clear single-tool constraint caused by the other tool being unavailable/rate-limited.
- If one AI validates its own implementation, the PHASE_LOG must say why that was acceptable.
- After validation, the assistant must provide all one-by-one commit commands in a single PowerShell code block per stage and must use this repo's local scripts.

---

## Next Phase

**Phase 1.1.0 - Standalone Automated Posting Runner**

Goal: Create a standalone Node.js runner that generates cards, starts or reuses the local Next.js server, prevents duplicate market-date posts, writes logs, supports dry-run testing, and publishes through Windows Task Scheduler.

Key changes:
- `scripts/generate-and-post.ts` - main runner
- `scripts/load-env.ts` - dotenv loader
- `scripts/ensure-next-server.ts` - local server startup/reuse helper
- `scripts/run-daily-fx-post.ps1` - Windows Task Scheduler entry point
- `scripts/commit-phase.ps1` - local one-file commit helper
- `scripts/promote.ps1` - local alpha-to-stable promotion helper
- `data/run-ledger.jsonl` - structured duplicate-prevention ledger, ignored by git
- `logs/` - human-readable run logs, ignored by git
- `package.json` - add `post:fx`
- `tsconfig.scripts.json` - script TypeScript config

See `docs/FUTURE_PLANS.md` for full scope.

---

## Phase History

| Version       | Date       | Status | Description |
|--------------|------------|--------|-------------|
| 0.1.0        | 2026-05-01 | alpha  | Initial working build before docs |
| 1.0.0-stable | 2026-05-24 | stable | Documentation baseline established |
| 1.0.1-stable | 2026-05-28 | stable | Automation plan and workflow hardening |

Full history in `docs/PHASE_LOG.md`.
