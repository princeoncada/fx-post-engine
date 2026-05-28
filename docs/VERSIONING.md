# Versioning - FX Post Engine

## Version Format

```
X.Y.Z-state
```

- **X** - Major: architecture-breaking changes, new layers, data schema changes, full rewrites
- **Y** - Minor: new features, new pages, new integrations
- **Z** - Patch: bug fixes, documentation changes, copy changes, style tweaks, config changes, dependency bumps
- **state** - `alpha` -> `beta` -> `stable`

---

## State Definitions

| State  | Meaning |
|--------|---------|
| alpha  | Implementation in progress or unvalidated. May break. |
| beta   | Feature-complete but not fully validated. Can be shown to client for review. |
| stable | All required validation passes. Phase log updated. Version locations synchronized. Committed. |

---

## Mandatory Change Versioning

Every repository change must be tied to a version, regardless of size.

- Documentation-only updates use a patch version unless they define a new major workflow or architecture.
- Small copy, config, test, planning, and prompt changes still require a `docs/PHASE_LOG.md` entry.
- No implementation, prompt, workflow, or documentation update may be treated as too small to version.
- The commit message must include the version string.
- If a change intentionally skips runtime validation because it is docs-only, the PHASE_LOG entry must say that directly.

---

## Promotion Rules

- **To beta:** implementation complete and relevant smoke test passed.
- **To stable:** all required validation commands in `docs/WORKFLOW.md` pass, `docs/PHASE_LOG.md` is updated, and all four version locations are in sync.

---

## Four Versioning Locations

All four must match before a version is declared stable:

1. `package.json` -> `"version"` field, without the state suffix
2. `docs/VERSIONING.md` -> Current Version table
3. `docs/AI_HANDOFF.md` -> `**Version:**` header line
4. `docs/PHASE_LOG.md` -> latest entry `## [X.Y.Z-state]` heading

---

## Current Version

| Field        | Value |
|-------------|-------|
| Version      | 1.0.1-stable |
| State        | stable |
| Date         | 2026-05-28 |
| Phase        | Phase 1.0.1 - Documentation Hardening |
| Next planned | Phase 1.1.0 - Standalone Automated Posting Runner |

---

## Version History

| Version       | State  | Date       | Description |
|--------------|--------|------------|-------------|
| 0.1.0        | alpha  | 2026-05-01 | Initial working build before docs |
| 1.0.0-stable | stable | 2026-05-24 | Documentation baseline established |
| 1.0.1-stable | stable | 2026-05-28 | Automation plan and workflow hardening |

---

## Next Version

**1.1.0-alpha** - Phase 1.1.0: Standalone Automated Posting Runner
Goal: Extract generate/post workflow into a scheduled runner with duplicate prevention, logs, dry-run support, and local server startup.
