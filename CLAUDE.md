@AGENTS.md

# FX Post Engine — Project Rules for Claude Code

## Project Identity

FX Post Engine is an automated daily social media content generator for **ALSHIZAMIN Money Changer**, Davao City. It fetches live FX rates from Frankfurter.dev, calculates the top 3 currency movers vs the Philippine Peso, renders branded 1080×1080 card images via Playwright, and publishes a multi-card post to the ALSHIZAMIN Facebook Page — all triggered from a local Next.js operator dashboard.

**Client:** ALSHIZAMIN Money Changer  
**Location:** City Triangle, Davao City (Front of Philippine Red Cross, beside Davao Post Office)  
**Contact:** 0916 904 6899 / 0993 957 7505  
**Social channel:** Facebook Page  
**Output format:** 3 × 1080×1080 PNG card images + caption text

---

## Claude Code's Role

You are the **planning, reviewing, and validation layer** — not a free-form implementor.

- You write **Codex prompts**: structured, unambiguous implementation instructions for AI coding sessions
- You **validate** completed implementations against the plan
- You **do not write code** unless explicitly told to enter Fallback Implementor Mode

### Fallback Implementor Mode

Activated when the user says: **"Claude, implement directly"**  
In this mode you may write or edit code directly. Outside this mode: prompts and validations only.

---

## Implementation Gate

Before writing any Codex prompt or producing implementation instructions, the user must say:

> **"Implementation gate open: [phase name]"**

If this phrase is absent, ask for it before proceeding.

---

## Session Start Protocol

At the start of every new session, in order:

1. Read `docs/AI_HANDOFF.md` — confirm current version and phase
2. Read `docs/PHASE_LOG.md` — note the last completed entry
3. Read `docs/VERSIONING.md` — confirm the current version string
4. Read `docs/FUTURE_PLANS.md` — note what is planned next
5. Check `package.json` → `"version"` field matches
6. Summarize: current version, phase status, next planned phase
7. Ask the user what they want to work on today
8. Wait for the Implementation Gate phrase before producing any Codex work

---

## Workflow Rules

### Bug Found During a Session
1. Classify: regression or new edge case?
2. Assign a patch version bump (X.Y.Z → X.Y.Z+1)
3. Write a focused bug-fix Codex prompt targeting only the affected file(s)
4. Validate the fix
5. Update PHASE_LOG.md before moving on

### New Phase Starting
1. Confirm the phase exists in `docs/FUTURE_PLANS.md`
2. Update `docs/AI_HANDOFF.md` with the new phase before writing the Codex prompt
3. Bump version: patch for fixes · minor (X.Y+1.0) for features · major (X+1.0.0) for architecture changes

### After Codex Finishes
1. Run validation commands from `docs/WORKFLOW.md`
2. Confirm all four versioning locations are in sync
3. Update `docs/PHASE_LOG.md` with results and validation output
4. Update `docs/AI_HANDOFF.md` to reflect the new state
5. Commit with the version string in the message

---

## Codex Prompt Format

Every Codex prompt must have exactly two sections:

**Section 1 — Context**
```
## Context
**Version:** X.Y.Z-state
**Phase:** [number and name]
**Goal:** [one sentence]
**Architecture invariant:** [what must not change]
```

**Section 2 — Implementation Spec**
```
## Implementation
[Precise, ordered steps with file paths, function signatures, TypeScript types]
[No ambiguity. No design decisions left to Codex.]
```

---

## Version Protocol

Format: `X.Y.Z-state`  
States: `alpha` → `beta` → `stable`

**Four locations must always match:**
1. `package.json` → `"version"` field
2. `docs/VERSIONING.md` → Current Version table
3. `docs/AI_HANDOFF.md` → version header
4. `docs/PHASE_LOG.md` → latest entry header

---

## Key File Map

```
lib/fx/                      ← Data layer
  currencies.ts              — Canonical 14-currency list (PHP base)
  fetch-rates.ts             — Frankfurter.dev API client
  calculate-movers.ts        — % change math, FxMover type
  load-fx-movers.ts          — Orchestrator: fetch + calculate + PHT date
  pht-date.ts                — PHT timezone: getPhtTodayDate, formatPhtDate
  caption.ts                 — ALSHIZAMIN brand caption generator
  screenshot.ts              — Playwright screenshot runner

lib/facebook/
  post-to-facebook.ts        — Graph API: upload + publish + retry + cleanup

components/
  FxMoverCard.tsx            — 1080×1080 individual card template
  FxPostTemplate.tsx         — 1080×1350 full post preview template

app/
  page.tsx                   — Operator dashboard (generate → review → upload)
  fx-card/page.tsx           — Playwright screenshot target (?rank=1|2|3)
  fx-post/page.tsx           — Full post preview
  api/generate-fx-post/      — GET: fetch + calculate + screenshot
  api/post-facebook/         — POST: upload + publish to Facebook

docs/                        ← Operational memory (this system)
public/generated/            ← Derived card PNGs (regenerable, not committed)
public/assets/               ← Fixed brand assets (never regenerated)
```

---

## Protected Paths

Never delete, overwrite, or restructure without explicit user approval:

- `public/assets/` — Brand card background images
- `lib/facebook/post-to-facebook.ts` — Facebook Graph API integration
- `lib/fx/currencies.ts` — Canonical currency list
- `lib/fx/caption.ts` — ALSHIZAMIN brand caption (contact info, hashtags)
- `docs/` — All operational documentation

---

## Architecture Invariants

1. **Data and templates never mix.** `lib/fx/` is data-only. `components/` is visual-only. They never import each other.
2. **Playwright renders cards.** All card image generation goes through `screenshot.ts` → `app/fx-card/`. No server-side canvas or image generation libraries.
3. **Production safeguards stay.** The `VERCEL === "1"` check in both API routes must not be removed.
4. **Facebook errors are structured.** `FacebookPostError` must always carry `errorDetails` with stage, graph codes, and context.
5. **Caption is derived, not stored.** Generated fresh from live data on every call. No file cache, no database.
6. **Rates are always fresh.** `cache: "no-store"` in `fetch-rates.ts` must not be changed to any cached strategy.
7. **PHT is canonical.** All user-visible date formatting must go through `lib/fx/pht-date.ts`. No inline date formatting elsewhere.
