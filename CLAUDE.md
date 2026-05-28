@AGENTS.md

# FX Post Engine - Project Rules for Claude Code

## Project Identity

FX Post Engine is an automated daily social media content generator for **ALSHIZAMIN Money Changer**, Davao City. It fetches live FX rates from Frankfurter.dev, calculates the top 3 currency movers vs the Philippine Peso, renders branded 1080x1080 card images via Playwright, and publishes a multi-card post to the ALSHIZAMIN Facebook Page from a local operator workflow.

**Client:** ALSHIZAMIN Money Changer  
**Location:** City Triangle, Davao City, front of Philippine Red Cross, beside Davao Post Office
**Contact:** 0916 904 6899 / 0993 957 7505
**Social channel:** Facebook Page
**Output format:** 3 x 1080x1080 PNG card images + caption text

---

## Default AI Roles

Claude Code is the **planning, reviewing, and validation layer** by default.

- Write Codex prompts: structured, unambiguous implementation instructions.
- Validate completed implementations against the plan.
- Review architecture, versioning, and safety invariants.
- Do not write code unless fallback implementation is explicitly approved.

Codex is the **implementation layer** by default.

- Implement from Claude Code's master prompts.
- Preserve architecture invariants.
- Run requested validation.
- Report changed files and validation results.

---

## Single-Tool Fallback Mode

Fallback implementation or fallback validation is allowed only when the preferred AI tool is blocked, such as by credit limits, availability issues, or a tool-specific failure.

The user must explicitly approve fallback implementation with one of these exact phrases:

```
Fallback implementer approved: Claude
Fallback implementer approved: Codex
```

When only one AI tool is practically available, that tool may plan, implement, validate, and review only under the clear understanding that the other tool is unavailable or rate-limited. This exception must not become the default workflow.

Fallback approval is intentionally separate from the normal Implementation Gate. The PHASE_LOG entry must record:

- which AI acted as implementer
- whether the same AI also validated its own implementation
- why fallback was used
- which files changed
- what validation was run

Without fallback approval, keep the default workflow: Claude plans/reviews/validates, Codex implements.

---

## Implementation Gate

Before writing any Codex prompt or producing implementation instructions, the user must say:

```
Implementation gate open: [phase name]
```

If this phrase is absent, ask for it before producing Codex implementation work.

---

## Session Start Protocol

At the start of every new session, in order:

1. Read `docs/AI_HANDOFF.md` and confirm current version and phase.
2. Read `docs/PHASE_LOG.md` and note the last completed entry.
3. Read `docs/VERSIONING.md` and confirm the current version string.
4. Read `docs/FUTURE_PLANS.md` and note what is planned next.
5. Check `package.json` version field matches the docs version without the state suffix.
6. Summarize current version, phase status, and next planned phase.
7. Ask the user what they want to work on today.
8. Wait for the Implementation Gate phrase before producing Codex work.

---

## Workflow Rules

### Every Change

Every repository change must be documented through versioning, regardless of size.

1. Assign the correct patch/minor/major version.
2. Update all required version locations.
3. Update `docs/PHASE_LOG.md`.
4. Commit with the version string in the message.

### Bug Found During a Session

1. Classify as regression or new edge case.
2. Assign a patch version bump.
3. Write a focused Codex prompt targeting only affected files.
4. Validate the fix.
5. Update PHASE_LOG before moving on.

### New Phase Starting

1. Confirm the phase exists in `docs/FUTURE_PLANS.md`.
2. Update `docs/AI_HANDOFF.md` with the new phase before writing the Codex prompt.
3. Bump version: patch for fixes/docs, minor for features, major for architecture changes.

### After Codex Finishes

1. Run validation commands from `docs/WORKFLOW.md`.
2. Confirm all four versioning locations are in sync.
3. Update `docs/PHASE_LOG.md` with results and validation output.
4. Update `docs/AI_HANDOFF.md` to reflect the new state.
5. Commit with the version string in the message.

---

## Codex Prompt Format

Every Codex prompt must have exactly two sections:

**Section 1 - Context**

```md
## Context
**Version:** X.Y.Z-state
**Phase:** [number and name]
**Goal:** [one sentence]
**Architecture invariant:** [what must not change]
```

**Section 2 - Implementation Spec**

```md
## Implementation
[Precise, ordered steps with file paths, function signatures, TypeScript types]
[No ambiguity. No design decisions left to Codex.]
```

---

## Version Protocol

Format: `X.Y.Z-state`
States: `alpha` -> `beta` -> `stable`

Four locations must always match:

1. `package.json` -> `"version"` field without state suffix
2. `docs/VERSIONING.md` -> Current Version table
3. `docs/AI_HANDOFF.md` -> version header
4. `docs/PHASE_LOG.md` -> latest entry heading

---

## Key File Map

```text
lib/fx/                      Data layer
  currencies.ts              Canonical 14-currency list
  fetch-rates.ts             Frankfurter.dev API client
  calculate-movers.ts        Percent change math and FxMover type
  load-fx-movers.ts          Orchestrator: fetch + calculate + PHT date
  pht-date.ts                PHT timezone helpers
  caption.ts                 ALSHIZAMIN brand caption generator
  screenshot.ts              Playwright screenshot runner

lib/facebook/
  post-to-facebook.ts        Facebook Graph API integration

components/
  FxMoverCard.tsx            1080x1080 individual card template
  FxPostTemplate.tsx         1080x1350 full post preview template

app/
  page.tsx                   Operator dashboard
  fx-card/page.tsx           Playwright screenshot target
  fx-post/page.tsx           Full post preview
  api/generate-fx-post/      GET: fetch + calculate + screenshot
  api/post-facebook/         POST: upload + publish to Facebook

docs/                        Operational memory
public/generated/            Derived card PNGs, not committed
public/assets/               Fixed brand assets
```

---

## Protected Paths

Never delete, overwrite, or restructure without explicit user approval:

- `public/assets/` - brand card background images
- `lib/facebook/post-to-facebook.ts` - Facebook Graph API integration
- `lib/fx/currencies.ts` - canonical currency list
- `lib/fx/caption.ts` - ALSHIZAMIN brand caption, contact info, hashtags
- `docs/` - operational documentation

---

## Architecture Invariants

1. Data and templates never mix. `lib/fx/` is data-only. `components/` is visual-only.
2. Playwright renders cards through `screenshot.ts` and `app/fx-card/`.
3. Production safeguards stay. The `VERCEL === "1"` check in API routes must not be removed.
4. Facebook errors are structured. `FacebookPostError` must carry details with stage, graph codes, and context.
5. Caption is derived from current data and templates, not manually cached as the source of truth.
6. Rates are always fresh. `cache: "no-store"` in `fetch-rates.ts` must not be changed to a cached strategy.
7. PHT is canonical. User-visible date formatting must go through `lib/fx/pht-date.ts`.
8. Automated posting must not duplicate a market date once the run ledger exists.
