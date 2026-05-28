# Future Plans — FX Post Engine

**Last updated:** 2026-05-24  
**Current stable version:** 1.0.0-stable

---

## Completed

| Version       | Phase                          | Description                                          |
|--------------|--------------------------------|------------------------------------------------------|
| 0.1.0        | Initial Build                  | Full working FX card generation + Facebook posting   |
| 1.0.0        | Documentation Baseline         | Full AI workflow docs system established             |

---

## In Progress

None.

---

## Planned

### Phase 1.1.0 — Standalone Generation Script
**Version:** 1.1.0  
**Priority:** High  
**Effort:** Small

**Goal:** Create a standalone Node.js script that runs the full generate + post workflow without requiring the Next.js dev server to be running. This enables scheduled automation via system cron, Windows Task Scheduler, or GitHub Actions.

**Why:** Currently the operator must open the browser and click the Generate button. A standalone script removes that friction and enables fully automated daily posting.

**Scope:**
- `scripts/generate-and-post.ts` — entry point: call loadFxMovers, generateCaption, screenshotFxCards, postToFacebook in sequence
- `scripts/load-env.ts` — dotenv loader (reads `.env.local`)
- `package.json` — add `"post:fx": "tsx scripts/generate-and-post.ts"` script
- `tsconfig.scripts.json` — TypeScript config for scripts/ folder (separate from Next.js)
- `scripts/README.md` — cron setup instructions for macOS (crontab) and Windows (Task Scheduler)

**Architecture note:** The script reuses existing lib/fx/ and lib/facebook/ functions directly. No new business logic. Playwright still handles card rendering but navigates to `http://localhost:3000` — the dev server must still be running OR the script must start a temporary server.

**Alternative approach (simpler):** Render cards server-side using React's renderToStaticMarkup + a headless screenshot library (e.g. @sparticuz/chromium for serverless). Deferred to Phase 1.3.0 if needed.

---

### Phase 1.2.0 — Post Archive Viewer
**Version:** 1.2.0  
**Priority:** Medium  
**Effort:** Medium

**Goal:** Add a local archive of past generated posts so the operator can review historical output and repost if needed.

**Why:** Currently generated PNGs go to `public/generated/` but there's no UI to browse them. The operator has no visibility into what was posted on a given date.

**Scope:**
- `public/generated/` naming convention already uses date: `fx-mover-{rank}-{date}.png`
- Add `/archive` route listing past generated card sets grouped by date
- Add "Repost" button per date group that calls `/api/post-facebook` with the stored paths
- No database — derive archive from filesystem scan of `public/generated/`

---

### Phase 1.3.0 — Caption Template Editor
**Version:** 1.3.0  
**Priority:** Medium  
**Effort:** Medium

**Goal:** Allow the operator to edit the Facebook caption template in the UI before posting, without touching source code.

**Why:** Contact info, hashtags, or messaging may change. Currently requires a code edit to `lib/fx/caption.ts`.

**Scope:**
- Replace hardcoded caption in `lib/fx/caption.ts` with a Handlebars or template-literal pattern
- Add editable caption template field in the operator dashboard
- Persist template to a local JSON file (`data/caption-template.json`)
- Caption preview updates live as the template is edited

---

### Phase 1.4.0 — Multi-Currency Configuration
**Version:** 1.4.0  
**Priority:** Low  
**Effort:** Small

**Goal:** Allow the operator to configure which currencies are tracked without touching source code.

**Why:** ALSHIZAMIN may want to focus on specific currencies relevant to their clientele (e.g. AED, SAR for OFW remittances).

**Scope:**
- Add currency selection UI to the operator dashboard
- Persist selection to `data/currency-config.json`
- `lib/fx/currencies.ts` reads from config at runtime (with fallback to hardcoded list)

---

### Phase 1.5.0 — Analytics Dashboard
**Version:** 1.5.0  
**Priority:** Low  
**Effort:** Large

**Goal:** Show basic engagement metrics (likes, comments, shares) for past Facebook posts within the operator dashboard.

**Why:** The operator currently has no visibility into post performance without opening Facebook manually.

**Scope:**
- Fetch post insights from Facebook Graph API (`/{post-id}/insights`)
- Store post IDs alongside archive entries
- Display engagement summary in the archive viewer (Phase 1.2.0 prerequisite)

---

## Discarded / Won't Do

| Item | Reason |
|------|--------|
| Vercel deployment of generate/post routes | Production deployment would require a different auth model and token management. App is intentionally local-only. |
| Instagram posting | Requires separate Meta Business Suite setup and image format adjustments. Out of scope until explicitly requested. |
| Database (PostgreSQL, SQLite) | No multi-user, no historical query needs. Filesystem is sufficient. Adding a database would add infrastructure complexity without benefit. |
| AI-generated caption content | Caption has legal/brand implications. Operator must remain in control of message content. Templates only. |
