# Phase Log — FX Post Engine

Full version history and validation records.

---

## Version History Table

| Version       | State  | Date       | Description                                  |
|--------------|--------|------------|----------------------------------------------|
| 0.1.0        | alpha  | 2026-05-01 | Initial working build (pre-docs era)         |
| 1.0.0-stable | stable | 2026-05-24 | Documentation baseline established          |

---

## [1.0.0-stable] — 2026-05-24
**Phase:** Phase 1.0 — Documentation Baseline  
**Type:** Documentation  
**Status:** stable

### Scope
Established the full operational documentation system for FX Post Engine, modeled after the HFK Publishing Engine's AI workflow structure.

### Files Added
- `CLAUDE.md` — Full project rules, Implementation Gate, Session Start Protocol, Architecture Invariants
- `master_prompt.md` — Complete Codex bootstrap document with all source files and phase plan
- `docs/VERSIONING.md` — Version state machine and history
- `docs/WORKFLOW.md` — Phase cycle and validation commands
- `docs/AI_HANDOFF.md` — Current state handoff document
- `docs/PHASE_LOG.md` — This file
- `docs/FUTURE_PLANS.md` — Living backlog
- `docs/DECISIONS.md` — Architecture decision records
- `docs/BRAND_GUIDE.md` — ALSHIZAMIN brand identity
- `docs/CONTENT_PHILOSOPHY.md` — FX data vs template ownership
- `docs/TEMPLATE_GUIDE.md` — Card template specifications
- `docs/API_GUIDE.md` — Frankfurter.dev + Facebook Graph API reference
- `docs/PAGE_CONSTITUTION.md` — ALSHIZAMIN mission and principles
- `docs/NEW_CHATHEAD_OPENER.md` — Session start template

### Validation
- TypeScript: N/A (no code changes)
- Build: N/A (no code changes)
- Smoke test: N/A (no code changes)
- Version sync: package.json manually updated to `1.0.0` required

### Notes
App was fully functional before this phase. Version bumped from `0.1.0` → `1.0.0` to formally mark the documentation baseline. The `package.json` version field must be manually updated from `0.1.0` to `1.0.0` to complete the four-location sync.

---

## [0.1.0] — 2026-05-01 (pre-docs era)
**Phase:** Initial Build  
**Type:** Feature (full initial implementation)  
**Status:** alpha

### Scope
Initial working build of the complete FX Post Engine. All core features implemented before the documentation system was established.

### Files Implemented
- `lib/fx/currencies.ts` — 14-currency canonical list
- `lib/fx/fetch-rates.ts` — Frankfurter.dev API client with `fetchRates` and `fetchPreviousDistinctRates`
- `lib/fx/calculate-movers.ts` — FxMover type, % change calculation, sort by absolute movement
- `lib/fx/load-fx-movers.ts` — Orchestrator combining fetch + calculate + PHT date
- `lib/fx/pht-date.ts` — PHT timezone helpers (getPhtTodayDate, formatPhtDate short/long)
- `lib/fx/caption.ts` — ALSHIZAMIN brand caption generator with contact info and hashtags
- `lib/fx/screenshot.ts` — Playwright Chromium screenshot runner (3 cards, 1080×1080)
- `lib/facebook/post-to-facebook.ts` — Facebook Graph API integration with retry logic, cleanup, FacebookPostError
- `components/FxMoverCard.tsx` — 1080×1080 branded card template
- `components/FxPostTemplate.tsx` — 1080×1350 full post preview template
- `app/page.tsx` — Operator dashboard (generate, preview, copy caption, upload)
- `app/fx-card/page.tsx` — Playwright target route (?rank=1|2|3)
- `app/fx-post/page.tsx` — Full post preview route
- `app/api/generate-fx-post/route.ts` — GET: fetch + calculate + screenshot
- `app/api/post-facebook/route.ts` — POST: upload + publish with FacebookPostError handling
- `app/data-deletion/page.tsx` — Meta data deletion compliance page
- `app/privacy-policy/page.tsx` — Privacy policy page
- `app/terms-of-service/page.tsx` — Terms of service page

### Validation
- Manual smoke test: Pass (generate + upload workflow functional)
- Facebook posting: Validated with real ALSHIZAMIN page
- Production safeguard: Confirmed VERCEL check blocks API routes on Vercel

### Notes
Built before documentation system was in place. Retroactively assigned `0.1.0-alpha` status. All contact info (0916 904 6899, 0993 957 7505) hardcoded in `lib/fx/caption.ts`.
