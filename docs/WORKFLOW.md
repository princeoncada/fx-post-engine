# Workflow - FX Post Engine

## Default AI Roles

The default workflow uses two AI tools with separate responsibilities:

- **Claude Code** is the architecture, planning, prompt-writing, review, and validation layer.
- **Codex** is the implementation layer that writes code from Claude Code's master prompts.

This split is the preferred workflow and should be used first whenever both tools are available.

---

## Single-Tool Fallback Rule

Either AI tool may temporarily act as implementer or validator only when the preferred tool is blocked, such as by credit limits, availability issues, or a tool-specific failure.

Fallback implementation is intentionally gated. The user must explicitly approve it using one of these phrases:

```
Fallback implementer approved: Claude
Fallback implementer approved: Codex
```

The fallback approval must be recorded in the relevant PHASE_LOG entry with:

- which AI acted as implementer
- whether the same AI also validated its own implementation
- why the default split was not used
- which files were changed
- what validation was run

When only one AI tool is practically available, that tool may plan, implement, validate, and review only under the clear understanding that the other tool is unavailable or rate-limited. This is an exception path, not the default workflow.

Without explicit fallback approval or a clear single-tool constraint, keep the default split: Claude plans/reviews/validates, Codex implements.

---

## Standard Phase Cycle

```
PLAN -> CODEX PROMPT -> BUILD -> VERIFY -> DOCUMENT -> COMMIT
```

### 1. PLAN
- Read `docs/AI_HANDOFF.md` and `docs/FUTURE_PLANS.md`.
- Confirm the phase scope with the user.
- Receive the Implementation Gate phrase.

### 2. CODEX PROMPT
- Write Section 1: Context.
- Write Section 2: Implementation Spec.
- Be specific: file paths, function signatures, TypeScript types, validation commands.
- Leave no design decisions to the implementer unless the user explicitly asks for exploration.

### 3. BUILD
- Codex implements from the prompt.
- If Codex is unavailable, fallback implementation requires explicit fallback approval.

### 4. VERIFY
- Run `.\scripts\validate.ps1` as the baseline validation runner.
- Run additional phase-specific checks listed below when applicable.
- Confirm architecture invariants in `CLAUDE.md` are preserved.
- Confirm the versioning requirements are satisfied.

### 5. DOCUMENT
- Update `docs/PHASE_LOG.md`.
- Update `docs/AI_HANDOFF.md`.
- Update `docs/VERSIONING.md`.
- Update `docs/FUTURE_PLANS.md` when planned scope changes.
- Update `package.json` version field for every versioned change.

### 6. COMMIT
Use one versioned commit message per logical change:

```bash
git commit -m "v1.x.x-state: [phase/change] - [one-line description]"
```

If using the single-file PowerShell commit helper, run it one file at a time and keep the version string in every message.

After validation, the assistant must provide commit commands in this order:

1. One fenced PowerShell code block containing all one-by-one `scripts/commit-phase.ps1` commands for the current pre-promotion changes.
2. One fenced PowerShell code block containing the stable promotion command, when the current version is alpha and promotion is applicable.
3. One fenced PowerShell code block containing all one-by-one `scripts/commit-phase.ps1` commands for files changed by promotion.

Do not reference commit scripts from another repository. Use this repo's local scripts:

```powershell
.\scripts\commit-phase.ps1 -File "path\to\file" -Message "vX.Y.Z-state: message"
.\scripts\promote.ps1 -Version "X.Y.Z"
```

---

## Mandatory Change Documentation

Every change must be documented through versioning, regardless of size.

- Docs-only changes require a patch version and a PHASE_LOG entry.
- Planning changes require a patch version and a PHASE_LOG entry.
- Test-only or config-only changes require a patch version and a PHASE_LOG entry.
- Runtime implementation changes require the appropriate patch/minor/major version.

No change may be committed as an undocumented adjustment.

---

## Validation Commands

Run these after every implementation unless the PHASE_LOG explicitly documents why a command is not applicable.

### Baseline Runner

```powershell
.\scripts\validate.ps1
```

This is the standard validation entry point. It runs diff hygiene, JSON parsing, mojibake scan, TypeScript, unit tests, and build checks. Phase-specific checks append below this command.

### TypeScript Check

```bash
npx tsc --noEmit
```

Must produce zero errors for runtime changes.

### Build Check

```bash
npm run build
```

Must complete without errors for runtime changes.

### Unit Tests

```bash
npm test
```

Must pass when tests exist for the phase or when test-covered code changes.

### Manual Smoke Test

1. Start the dev server: `npm run dev`
2. Open `http://localhost:3000`
3. Click **Generate Latest FX Post**
4. Verify that 3 cards appear in the grid.
5. Verify dates are correct PHT dates.
6. Verify caption shows ALSHIZAMIN contact info.
7. Verify **Copy Caption** copies to clipboard.
8. Verify **Upload to Facebook Page** button is visible. Do not click unless testing posting.

### Automation Dry Run

For generation workflow changes, run the dry-run command once it exists:

```bash
npm run post:fx -- --dry-run
```

Dry-run is an integration smoke test, not a replacement for unit tests.

### Facebook Integration Check

Only run when intentionally testing real posting:

```bash
echo $META_PAGE_ID
echo $META_PAGE_ACCESS_TOKEN
echo $META_GRAPH_VERSION
```

All must return non-empty values before real posting.

---

## Version Rules

### Bug Fix Versioning

Bugs that affect previously stable behavior get a patch bump:

```
1.0.1-stable -> 1.0.2-stable
```

Bugs found inside an in-progress alpha phase are fixed in place until that phase stabilizes.

### Version Ordering

Always increment, never reuse. If `1.1.0-alpha` is abandoned, the next attempt becomes `1.1.1-alpha` or moves to a later minor version depending on scope.

---

## Mandatory Workflow Artifacts

Every phase completion requires:

- [ ] Relevant validation passed or explicitly marked N/A in PHASE_LOG
- [ ] `docs/PHASE_LOG.md` updated
- [ ] `docs/AI_HANDOFF.md` updated
- [ ] `docs/VERSIONING.md` Current Version table updated
- [ ] `package.json` version field updated
- [ ] Git commit created with version string
- [ ] Final response includes one-by-one commit commands in a single PowerShell code block per stage

---

## Two-Section Response Format After Validation

After Claude Code validates a completed phase, respond with exactly two sections:

**Section 1 - Validation Result**

```
PASS / FAIL

TypeScript: [pass/fail/N/A + details]
Build: [pass/fail/N/A + details]
Tests: [pass/fail/N/A + details]
Smoke test: [pass/fail/N/A + observations]
Version sync: [pass/fail - list all four locations]
```

**Section 2 - Next Steps**

```
Next phase: [name and version]
Action required: [what the user should do now]
```

---

## Safety Rules

1. Never remove the `VERCEL === "1"` guard from API routes.
2. Never commit `.env` or `.env.local` files.
3. Never commit files from `public/generated/`.
4. Never modify `lib/fx/caption.ts` contact info without explicit client approval.
5. Never change card dimensions or Playwright viewport without updating `docs/TEMPLATE_GUIDE.md`.
6. Never allow duplicate automated Facebook posts for the same latest market date once the run ledger exists.

---

## Session Checkpoint

At the end of every session, confirm:

- [ ] All intended changes are committed or clearly listed as uncommitted
- [ ] `docs/AI_HANDOFF.md` reflects current state
- [ ] `docs/PHASE_LOG.md` has a new entry or explicitly notes no changes this session
- [ ] No sensitive env vars are staged or committed

Use `docs/COMPACT_STRATEGY.md` when a session is long, a phase has just stabilized, or a new session should start from repo state instead of chat history.
