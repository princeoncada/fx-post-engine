# Phase Log - FX Post Engine

Full version history and validation records.

---

## Version History Table

| Version       | State  | Date       | Description |
|--------------|--------|------------|-------------|
| 0.1.0        | alpha  | 2026-05-01 | Initial working build before docs |
| 1.0.0-stable | stable | 2026-05-24 | Documentation baseline established |
| 1.0.1-stable | stable | 2026-05-28 | Automation plan and workflow hardening |

---

## [1.0.1-stable] - 2026-05-28
**Phase:** Phase 1.0.1 - Documentation Hardening
**Type:** Documentation patch
**Status:** stable

### Scope
Documented the approved automation roadmap as a patch and hardened the project workflow rules so every change, regardless of size, must be versioned and logged.

### Files Updated
- `package.json` - moved version to `1.0.1`
- `CLAUDE.md` - clarified Claude/Codex default roles and explicit fallback implementer approval
- `docs/WORKFLOW.md` - added mandatory change documentation and fallback implementer rules
- `docs/VERSIONING.md` - added mandatory change versioning policy
- `docs/AI_HANDOFF.md` - updated current state and next phase
- `docs/FUTURE_PLANS.md` - documented automation runner, scheduler, logs, duplicate guard, dry-run, archive, and notifications
- `docs/PHASE_LOG.md` - recorded this patch
- `scripts/commit-phase.ps1` - added local one-file commit helper
- `scripts/promote.ps1` - added local alpha-to-stable promotion helper tailored to this repo

### Workflow Hardening
- Claude Code remains the default architecture, master-prompt, review, and validation layer.
- Codex remains the default implementation layer.
- Either AI may act as fallback implementer or validator only after explicit user approval or a clear single-tool constraint:
  - `Fallback implementer approved: Claude`
  - `Fallback implementer approved: Codex`
- Fallback use must be recorded with reason, implementer, whether self-validation occurred, changed files, and validation.
- Every docs, planning, config, test, prompt, or runtime change must be tied to a version and PHASE_LOG entry.
- After validation, commit commands must be provided as one PowerShell code block per stage: pre-promotion commits, promotion command, and post-promotion commits.

### Automation Planning Notes
- Phase 1.1.0 now targets a standalone scheduled posting runner.
- Runner must start or reuse the local Next.js server for Playwright screenshots.
- Runner must prevent duplicate Facebook posts for the same latest market date using `data/run-ledger.jsonl`.
- Runner must support `--dry-run` as the generation workflow integration smoke test.
- Human-readable logs must be stored under `logs/`.
- Windows Task Scheduler should run at 7:00 PM local machine time, corresponding to 7:00 AM PHT while the machine is on Eastern Daylight Time.

### Validation
- TypeScript: N/A - docs-only patch
- Build: N/A - docs-only patch
- Tests: N/A - docs-only patch
- Smoke test: N/A - docs-only patch
- Version sync: `package.json`, `docs/VERSIONING.md`, `docs/AI_HANDOFF.md`, and `docs/PHASE_LOG.md` set to `1.0.1-stable`/`1.0.1`

---

## [1.0.0-stable] - 2026-05-24
**Phase:** Phase 1.0 - Documentation Baseline
**Type:** Documentation
**Status:** stable

### Scope
Established the full operational documentation system for FX Post Engine, modeled after the HFK Publishing Engine's AI workflow structure.

### Files Added
- `CLAUDE.md` - project rules, Implementation Gate, Session Start Protocol, Architecture Invariants
- `master_prompt.md` - complete Codex bootstrap document with source files and phase plan
- `docs/VERSIONING.md` - version state machine and history
- `docs/WORKFLOW.md` - phase cycle and validation commands
- `docs/AI_HANDOFF.md` - current state handoff document
- `docs/PHASE_LOG.md` - phase log
- `docs/FUTURE_PLANS.md` - living backlog
- `docs/DECISIONS.md` - architecture decision records
- `docs/BRAND_GUIDE.md` - ALSHIZAMIN brand identity
- `docs/CONTENT_PHILOSOPHY.md` - FX data vs template ownership
- `docs/TEMPLATE_GUIDE.md` - card template specifications
- `docs/API_GUIDE.md` - Frankfurter.dev and Facebook Graph API reference
- `docs/PAGE_CONSTITUTION.md` - ALSHIZAMIN mission and principles
- `docs/NEW_CHATHEAD_OPENER.md` - session start template

### Validation
- TypeScript: N/A - no code changes
- Build: N/A - no code changes
- Smoke test: N/A - no code changes
- Version sync: Follow-up completed in `1.0.1-stable`

### Notes
App was fully functional before this phase. Version bumped from `0.1.0` to `1.0.0` to formally mark the documentation baseline.

---

## [0.1.0] - 2026-05-01
**Phase:** Initial Build
**Type:** Feature
**Status:** alpha

### Scope
Initial working build of the complete FX Post Engine before the documentation system was established.

### Files Implemented
- `lib/fx/currencies.ts` - 14-currency canonical list
- `lib/fx/fetch-rates.ts` - Frankfurter.dev API client
- `lib/fx/calculate-movers.ts` - FxMover type and percent change calculation
- `lib/fx/load-fx-movers.ts` - orchestrator combining fetch, calculate, and PHT date
- `lib/fx/pht-date.ts` - PHT timezone helpers
- `lib/fx/caption.ts` - ALSHIZAMIN brand caption generator
- `lib/fx/screenshot.ts` - Playwright screenshot runner
- `lib/facebook/post-to-facebook.ts` - Facebook Graph API integration
- `components/FxMoverCard.tsx` - 1080x1080 branded card template
- `components/FxPostTemplate.tsx` - 1080x1350 full post preview template
- `app/page.tsx` - operator dashboard
- `app/fx-card/page.tsx` - Playwright target route
- `app/fx-post/page.tsx` - full post preview route
- `app/api/generate-fx-post/route.ts` - generate API route
- `app/api/post-facebook/route.ts` - Facebook publish API route
- `app/data-deletion/page.tsx` - Meta data deletion compliance page
- `app/privacy-policy/page.tsx` - privacy policy page
- `app/terms-of-service/page.tsx` - terms of service page

### Validation
- Manual smoke test: Pass
- Facebook posting: Validated with real ALSHIZAMIN page
- Production safeguard: Confirmed Vercel guard blocks generate/post routes

### Notes
Retroactively assigned `0.1.0-alpha` status.
