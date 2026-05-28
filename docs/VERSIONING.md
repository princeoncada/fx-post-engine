# Versioning — FX Post Engine

## Version Format

```
X.Y.Z-state
```

- **X** — Major: architecture-breaking changes (new layers, data schema changes, full rewrites)
- **Y** — Minor: new features, new pages, new integrations (non-breaking)
- **Z** — Patch: bug fixes, copy changes, style tweaks, dependency bumps
- **state** — `alpha` (unstable/experimental) → `beta` (testable, not hardened) → `stable` (validated and committed)

---

## State Definitions

| State  | Meaning |
|--------|---------|
| alpha  | Implementation in progress or unvalidated. May break. |
| beta   | Feature-complete but not fully validated. Can be shown to client for review. |
| stable | All validation commands pass. Phase log updated. Committed. |

---

## Promotion Rules

- **→ beta:** Codex implementation complete, manual smoke test passed
- **→ stable:** All validation commands in WORKFLOW.md pass, PHASE_LOG.md updated, all four version locations in sync

---

## Four Versioning Locations

All four must match before a version is declared stable:

1. `package.json` → `"version"` field
2. `docs/VERSIONING.md` → Current Version table (below)
3. `docs/AI_HANDOFF.md` → `**Version:**` header line
4. `docs/PHASE_LOG.md` → latest entry `## [X.Y.Z-state]` heading

---

## Current Version

| Field        | Value                    |
|-------------|--------------------------|
| Version      | 1.0.0-stable             |
| State        | stable                   |
| Date         | 2026-05-24               |
| Phase        | Phase 1.0 — Documentation Baseline |
| Next planned | Phase 1.1.0 — Standalone Generation Script |

---

## Version History

| Version       | State  | Date       | Description                                  |
|--------------|--------|------------|----------------------------------------------|
| 0.1.0        | alpha  | 2026-05-01 | Initial working build (pre-docs era)         |
| 1.0.0-stable | stable | 2026-05-24 | Documentation baseline established          |

---

## Next Version

**1.1.0-alpha** — Phase 1.1.0: Standalone Generation Script  
Goal: Extract generate+post workflow into a standalone Node.js script callable by cron without the Next.js dev server.
