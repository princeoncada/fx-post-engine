# New Session Opener — FX Post Engine

Copy the block between START and END into a new Claude Code chat to bootstrap the session correctly.

---

<!-- START -->

I'm starting a new development session for **FX Post Engine** — ALSHIZAMIN Money Changer's daily FX social media generator (Next.js, Playwright, Facebook Graph API).

Please run the full **Session Start Protocol** from `CLAUDE.md`:

1. Read `docs/AI_HANDOFF.md` — confirm current version and phase
2. Read `docs/PHASE_LOG.md` — note the last completed entry
3. Read `docs/VERSIONING.md` — confirm the current version string
4. Read `docs/FUTURE_PLANS.md` — note what is planned next
5. Check `package.json` → `"version"` field
6. Summarize: current version, phase status, and next planned phase
7. Ask me what I want to work on today

Wait for my response before doing anything else.

<!-- END -->

---

## Notes

- After the summary, the user will provide the **Implementation Gate phrase** to unlock Codex work: `"Implementation gate open: [phase name]"`
- If no Implementation Gate phrase is given, Claude Code asks for it before writing any Codex prompt
- For Fallback Implementor Mode (direct code writing): user says `"Claude, implement directly"`
- For reference, the full project rules are in `CLAUDE.md` and the complete architecture is in `master_prompt.md`
