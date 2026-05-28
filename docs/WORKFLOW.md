# Workflow — FX Post Engine

## Claude Code's Role

Claude Code is the **planning, reviewing, and validation layer** for all development phases. It does not write code unless explicitly activated in Fallback Implementor Mode (`"Claude, implement directly"`).

**Normal mode responsibilities:**
- Read session state from `docs/AI_HANDOFF.md` and `docs/PHASE_LOG.md`
- Write Codex prompts in the two-section format (see CLAUDE.md)
- Validate completed work against the plan
- Update operational docs after each phase

---

## Standard Phase Cycle

```
PLAN → CODEX PROMPT → BUILD → VERIFY → DOCUMENT → COMMIT
```

### 1. PLAN
- Read `docs/AI_HANDOFF.md` and `docs/FUTURE_PLANS.md`
- Confirm the phase scope with the user
- Receive Implementation Gate phrase

### 2. CODEX PROMPT
- Write Section 1 (Context) and Section 2 (Implementation Spec)
- Be specific: file paths, function signatures, TypeScript types
- Include no ambiguity — no design decisions left to Codex

### 3. BUILD
- Paste the Codex prompt into a fresh Codex/AI session
- Codex implements based on the spec

### 4. VERIFY
- Run all validation commands (listed below)
- Confirm four versioning locations match
- Check architecture invariants (CLAUDE.md) are preserved

### 5. DOCUMENT
- Update `docs/PHASE_LOG.md` — add new entry with results
- Update `docs/AI_HANDOFF.md` — update version, phase, next steps
- Update `docs/VERSIONING.md` — update Current Version table

### 6. COMMIT
```
git add -p
git commit -m "v1.x.x-stable: [Phase name] - [one-line description]"
```

---

## Validation Commands

Run these after every implementation. All must pass before declaring `stable`.

### TypeScript Check
```bash
npx tsc --noEmit
```
Must produce zero errors.

### Build Check
```bash
npm run build
```
Must complete without errors.

### Unit Tests
```bash
npm test
```
Must pass all tests (if any exist for the phase).

### Manual Smoke Test
1. Start the dev server: `npm run dev`
2. Open `http://localhost:3000`
3. Click **Generate Latest FX Post**
4. Verify: 3 cards appear in the grid, dates are correct PHT, caption shows ALSHIZAMIN contact info
5. Verify: **Copy Caption** copies to clipboard
6. Verify: **Upload to Facebook Page** button is visible (do not click unless ready to post)

### Facebook Integration Check (only when testing posting)
```bash
# Verify env vars are set
echo $META_PAGE_ID
echo $META_PAGE_ACCESS_TOKEN
echo $META_GRAPH_VERSION
```
All must return non-empty values.

---

## Bug Fix Versioning Rule

Bugs found during a phase that affect previously-stable behaviour get a patch bump:

```
1.0.0-stable → 1.0.1-stable
```

Bugs found within an in-progress alpha phase are fixed in place (no additional bump until the phase stabilizes).

---

## Version Ordering Rule

Always increment, never reuse. If `1.1.0-alpha` was abandoned, the next attempt becomes `1.1.1-alpha` or restarts as `1.2.0-alpha` depending on scope.

---

## Mandatory Workflow Artifacts

Every phase completion requires all of the following before marking stable:

- [ ] TypeScript check passes (`tsc --noEmit`)
- [ ] Build check passes (`npm run build`)
- [ ] Manual smoke test complete (generate + preview)
- [ ] `docs/PHASE_LOG.md` updated
- [ ] `docs/AI_HANDOFF.md` updated
- [ ] `docs/VERSIONING.md` current version table updated
- [ ] `package.json` version field updated
- [ ] Git commit created with version string

---

## Two-Section Response Format (Post-Validation)

After Claude Code validates a completed phase, the response must have exactly two sections:

**Section 1 — Validation Result**
```
PASS / FAIL

TypeScript: [pass/fail + any errors]
Build: [pass/fail + any errors]
Tests: [pass/fail + any errors]
Smoke test: [pass/fail + observations]
Version sync: [pass/fail — list all four locations]
```

**Section 2 — Next Steps**
```
Next phase: [name and version]
Action required: [what the user should do now]
```

---

## Safety Rules (Never Change)

1. Never remove the `VERCEL === "1"` guard from API routes
2. Never commit `.env` or `.env.local` files
3. Never commit files from `public/generated/` (add to `.gitignore`)
4. Never modify `lib/fx/caption.ts` contact info without explicit client approval
5. Never change the card dimensions (1080×1080) or the Playwright viewport without updating TEMPLATE_GUIDE.md

---

## Session Checkpoint

At the end of every session, confirm:
- [ ] All changes committed
- [ ] `docs/AI_HANDOFF.md` reflects current state
- [ ] `docs/PHASE_LOG.md` has a new entry (or notes "no changes this session")
- [ ] No sensitive env vars in committed files
