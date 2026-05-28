# Architecture Decision Records — FX Post Engine

---

## ADR-001: Next.js App Router as Operator Dashboard

**Status:** Accepted  
**Date:** 2026-05-01

**Context:** We need a local UI for the operator to trigger generation and review cards before posting. The card templates must render as HTML/CSS for Playwright to screenshot.

**Decision:** Use Next.js App Router. The operator dashboard is a Client Component (`app/page.tsx`). Card render routes (`app/fx-card/`, `app/fx-post/`) are Server Components that load live data and return the visual template.

**Consequences:**
- Card templates are standard React + Tailwind CSS — easy to iterate on visually
- Playwright can screenshot rendered routes directly
- No need for a separate frontend build tool
- API routes provide clean separation between UI and integration logic

---

## ADR-002: Playwright for Card Image Generation

**Status:** Accepted  
**Date:** 2026-05-01

**Context:** We need to generate 1080×1080 PNG cards that look exactly like the React components rendered in the browser.

**Decision:** Use Playwright Chromium to navigate to `app/fx-card/?rank=1|2|3` and screenshot each card. The screenshot dimensions are locked to 1080×1080 via Playwright's `viewport` option.

**Alternatives considered:**
- `html-to-image` or `dom-to-image`: Browser-only, can't run server-side in a Next.js API route
- `sharp` + canvas: Requires implementing the layout in canvas draw calls, not React. Far more fragile.
- Puppeteer: Equivalent capability. Playwright has better TypeScript ergonomics and is actively maintained.

**Consequences:**
- Playwright Chromium must be installed (`npx playwright install chromium`)
- The Next.js dev server must be running when screenshots are generated
- Card templates must be correct React components — no special rendering path needed

---

## ADR-003: Frankfurter.dev as FX Data Source

**Status:** Accepted  
**Date:** 2026-05-01

**Context:** We need daily FX rates for 14 currencies vs PHP. Rates update once per trading day.

**Decision:** Use `https://api.frankfurter.dev/v1/` (free, no API key required, covers all 14 currencies, supports date-based historical queries).

**Alternatives considered:**
- ExchangeRate-API: Requires API key, free tier has rate limits
- Open Exchange Rates: Requires API key, PHP base not available on free tier
- Bank-specific APIs (BSP, etc.): Unreliable, no standard format

**Consequences:**
- Frankfurter derives rates from European Central Bank data — rates are mid-market, not ALSHIZAMIN's actual buying/selling rates
- The "Market reference only" disclaimer on all cards and in the caption is mandatory
- `fetchPreviousDistinctRates` handles weekends and holidays by walking back up to 10 days

---

## ADR-004: Facebook Graph API Direct Integration

**Status:** Accepted  
**Date:** 2026-05-01

**Context:** Posts must appear on the ALSHIZAMIN Facebook Page with 3 attached images.

**Decision:** Use the Facebook Graph API directly (no third-party scheduling service). Upload photos as unpublished first, then create a feed post with `attached_media`.

**Why direct instead of a scheduling service:**
- No recurring cost
- No dependency on third-party data retention policies
- Full control over retry logic and error handling
- The operator reviews content before posting — no scheduling needed initially

**Consequences:**
- Requires a long-lived Page Access Token (manual renewal every ~60 days unless using a System User token)
- `META_PAGE_ACCESS_TOKEN` must be kept in `.env.local` and never committed
- Retry logic (3 attempts with delays: 1s, 3s, 7s) is built into `post-to-facebook.ts`
- Photo cleanup runs automatically if the feed post fails

---

## ADR-005: Local-Only Operation (No Production Deployment)

**Status:** Accepted  
**Date:** 2026-05-01

**Context:** The app uses Playwright (requires a local Chromium), reads from the filesystem, and accesses sensitive API tokens. Deploying to Vercel or another serverless platform would require a fundamentally different architecture.

**Decision:** The app is intentionally local-only. Both API routes (`generate-fx-post` and `post-facebook`) return 403 when `process.env.VERCEL === "1"`.

**Consequences:**
- No infrastructure cost
- No token exposure risk from a deployed API
- The operator must run `npm run dev` before generating cards
- Automation (Phase 1.1.0) requires a local scheduler, not a cloud trigger

---

## ADR-006: PHT (Asia/Manila) as Canonical Timezone

**Status:** Accepted  
**Date:** 2026-05-01

**Context:** ALSHIZAMIN is in Davao City, Philippines. All date references on cards and captions must be in Philippine Time (UTC+8) so they make sense to the local audience.

**Decision:** All date formatting goes through `lib/fx/pht-date.ts`. No inline date formatting anywhere else in the codebase.

**Functions:**
- `getPhtTodayDate()` — returns today's date as `YYYY-MM-DD` in PHT
- `formatPhtDate(date, "short")` — returns `MM/DD/YYYY` in PHT
- `formatPhtDate(date, "long")` — returns `Month DD, YYYY` in PHT

**Consequences:**
- Cards and captions always show correct PHT dates regardless of the operator's machine timezone
- The `"Retrieved: [date] PHT"` label on all cards is accurate
- Adding new date display formats requires updating only `pht-date.ts`

---

## ADR-007: No Database

**Status:** Accepted  
**Date:** 2026-05-01

**Context:** Consider whether to persist generated posts, captions, or rate data to a database.

**Decision:** No database. The app is stateless. Generated PNGs go to `public/generated/` (filesystem). The caption is regenerated on each call. No post history is tracked.

**Why:**
- Single operator, local machine — no multi-user or multi-device needs
- Frankfurter.dev is always available for historical rate lookups
- Filesystem is sufficient for a local archive (Phase 1.2.0)
- A database would add infrastructure complexity (migration management, schema, connection pooling) with zero benefit for this use case

**Consequences:**
- `public/generated/` accumulates PNG files over time — operator should periodically clean old files
- No post history without Phase 1.2.0 (archive viewer)
- If the machine's filesystem is lost, all generated content is lost (but is regenerable from live data)
