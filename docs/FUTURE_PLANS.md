# Future Plans - FX Post Engine

**Last updated:** 2026-05-28
**Current stable version:** 1.0.4-stable

---

## Completed

| Version       | Phase                  | Description                                        |
|--------------|------------------------|----------------------------------------------------|
| 0.1.0        | Initial Build          | Full working FX card generation + Facebook posting |
| 1.0.0        | Documentation Baseline | Full AI workflow docs system established           |
| 1.0.1        | Workflow Automation Scripts | HFK 5.1.0-equivalent local commit, validation, promotion, and compact-strategy workflow |
| 1.0.2        | Workflow Automation Completion | Local validate runner and compact strategy wired into docs |

---

## In Progress

| Version      | Phase | Description |
|--------------|-------|-------------|
| 1.0.5-alpha | Targeted Lockfile Version Sync | Allow only package-lock root project metadata version updates |

---

## Planned

### Phase 1.1.0 - Standalone Automated Posting Runner
**Version:** 1.1.0
**Priority:** High
**Effort:** Medium

**Goal:** Create a standalone Node.js runner that can generate cards, prevent duplicate market-date posts, start the local Next.js server when needed, and publish to Facebook from a scheduled Windows Task Scheduler job.

**Why:** Currently the operator must open the browser and click the Generate button. The target workflow should post automatically once per fresh market date, even if the PC was asleep or turned off at the scheduled time.

**Scope:**
- `scripts/generate-and-post.ts` - entry point that calls `loadFxMovers`, `generateCaption`, `screenshotFxCards`, and `postToFacebook`
- `scripts/load-env.ts` - dotenv loader that reads `.env.local`
- `scripts/ensure-next-server.ts` - start or reuse a local Next.js server for Playwright card rendering
- `scripts/run-daily-fx-post.ps1` - Windows Task Scheduler entry point
- `package.json` - add `"post:fx": "tsx scripts/generate-and-post.ts"`
- `tsconfig.scripts.json` - TypeScript config for the scripts folder
- `scripts/README.md` - Windows Task Scheduler setup instructions and local test commands
- `logs/` - human-readable run logs, ignored by git
- `data/run-ledger.jsonl` - structured append-only run ledger, ignored by git

**Required behavior:**
- Schedule the task for **7:00 PM on this Windows machine**, which corresponds to **7:00 AM PHT** while the machine is on Eastern Daylight Time.
- If the PC is off or asleep at the scheduled time, the next run after startup must check the latest available market data and continue only if that market date has not already been posted.
- Before posting, read the structured run ledger and block posting when `latestData.date` already has a successful `posted` record.
- Weekend and holiday behavior must be safe: if Saturday, Sunday, or early Monday still resolves to the previous Friday's market data, the script must not post a duplicate Friday card set.
- A failed run may be retried. A market date is considered blocked only after a successful Facebook post is recorded.
- Write one human-readable log file per run and append one structured JSON line per major state transition: `started`, `generated`, `skipped_duplicate`, `posted`, `failed`.
- Store enough data in the structured ledger to audit a run: run timestamp, PHT retrieved date, latest market date, previous market date, image paths, caption preview/hash, Facebook post ID, uploaded photo IDs, and error details when present.
- Default mode posts to Facebook. `--dry-run` generates cards and caption, writes logs, and skips Facebook posting.

**Dry-run policy:** `npm run post:fx -- --dry-run` is the required tester for any feature touching the generation workflow. Dry-run is not a replacement for unit tests. Use unit tests for deterministic duplicate-guard, ledger, and argument-parsing behavior; use dry-run as the integration smoke test that proves the real data/card pipeline still works without publishing.

**Architecture note:** The script reuses existing `lib/fx/` and `lib/facebook/` functions directly. No FX math, caption, or Facebook upload logic should be duplicated. Playwright still handles card rendering by navigating to the local Next.js route. The runner is responsible for ensuring that local server exists before screenshots begin.

**Alternative approach:** Render cards server-side using React's `renderToStaticMarkup` plus a headless screenshot library. Defer this unless the local Next.js server dependency becomes operationally unreliable.

---

### Phase 1.2.0 - Run Archive and Duplicate Guard UI
**Version:** 1.2.0
**Priority:** Medium
**Effort:** Medium

**Goal:** Add a local archive of past generated posts and scheduler runs so the operator can review what happened, confirm duplicate prevention decisions, and inspect failures.

**Why:** Automation needs traceability. Generated PNGs and run logs exist on disk, but the operator should not have to inspect raw files to know whether today's market data was posted, skipped, or failed.

**Scope:**
- `public/generated/` naming convention already uses date: `fx-mover-{rank}-{date}.png`
- Add `/archive` route listing past generated card sets grouped by latest market date
- Read from `data/run-ledger.jsonl` for posted/skipped/failed status
- Link each archive entry to the human-readable log file for that run
- Show whether a market date is blocked from posting because a successful post already exists
- Add a guarded "Repost" action only for explicit operator recovery, never for normal automation
- No database - use filesystem JSONL and generated image files

---

### Phase 1.2.1 - Failure Notifications
**Version:** 1.2.1
**Priority:** Medium
**Effort:** Small

**Goal:** Make automation failures visible without requiring the operator to check logs manually every day.

**Why:** Once posting is scheduled, silent failures are the main operational risk. The operator needs a clear signal when the scheduled run failed, skipped unexpectedly, or could not reach Facebook/Frankfurter.

**Scope:**
- Write `logs/latest-error.txt` on failed runs
- Write `logs/latest-success.txt` on successful posts
- Add optional notification provider later: email, Telegram, Discord, or local Windows toast
- Keep notifications outside the core posting path so a notification failure does not mark the FX post itself as failed

---

### Phase 1.3.0 - Caption Template Editor
**Version:** 1.3.0
**Priority:** Medium
**Effort:** Medium

**Goal:** Allow the operator to edit the Facebook caption template in the UI before posting, without touching source code.

**Why:** Contact info, hashtags, or messaging may change. Currently requires a code edit to `lib/fx/caption.ts`.

**Scope:**
- Replace hardcoded caption in `lib/fx/caption.ts` with a Handlebars or template-literal pattern
- Add editable caption template field in the operator dashboard
- Persist template to a local JSON file: `data/caption-template.json`
- Caption preview updates live as the template is edited

---

### Phase 1.4.0 - Multi-Currency Configuration
**Version:** 1.4.0
**Priority:** Low
**Effort:** Small

**Goal:** Allow the operator to configure which currencies are tracked without touching source code.

**Why:** ALSHIZAMIN may want to focus on specific currencies relevant to their clientele, such as AED or SAR for OFW remittances.

**Scope:**
- Add currency selection UI to the operator dashboard
- Persist selection to `data/currency-config.json`
- `lib/fx/currencies.ts` reads from config at runtime with fallback to the hardcoded list

---

### Phase 1.5.0 - Analytics Dashboard
**Version:** 1.5.0
**Priority:** Low
**Effort:** Large

**Goal:** Show basic engagement metrics such as likes, comments, and shares for past Facebook posts within the operator dashboard.

**Why:** The operator currently has no visibility into post performance without opening Facebook manually.

**Scope:**
- Fetch post insights from Facebook Graph API: `/{post-id}/insights`
- Store post IDs alongside archive entries
- Display engagement summary in the archive viewer

---

## Discarded / Won't Do

| Item | Reason |
|------|--------|
| Vercel deployment of generate/post routes | Production deployment would require a different auth model and token management. App is intentionally local-only. |
| Instagram posting | Requires separate Meta Business Suite setup and image format adjustments. Out of scope until explicitly requested. |
| Database: PostgreSQL or SQLite | No multi-user or complex query needs yet. Filesystem JSONL is sufficient and keeps operations simple. |
| AI-generated caption content | Caption has legal and brand implications. Operator must remain in control of message content. Templates only. |
| Separate operator review mode for automation | Low value after scheduled posting exists. Manual review is already covered by running the existing dashboard with `npm run dev`; adding another review mode would create another path to maintain without changing the real workflow. |




