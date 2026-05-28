# Context Window Management Strategy - FX Post Engine

## When to Open a New Session

Open a new session when one of these signals appears:

- A stable phase was committed and pushed.
- The conversation has crossed roughly 15 to 20 turns.
- The AI starts confusing earlier decisions.
- Work shifts to a different phase or series.
- A phase fails validation and needs a clean re-scope.

A clean stable repository state is the best reset point because the repo becomes the shared memory.

---

## What Carries State

The durable state lives in repo files, not chat memory:

- `docs/AI_HANDOFF.md` - current state and next recommended phase
- `docs/PHASE_LOG.md` - full phase history and validation records
- `docs/VERSIONING.md` - active version and versioning rules
- `docs/FUTURE_PLANS.md` - planned work
- `docs/WORKFLOW.md` - required AI and human workflow
- `docs/NEW_CHATHEAD_OPENER.md` - opener for a new AI session

Do not replicate large phase history in chat. Reference these files instead.

---

## Session Log Guidance

When a session is paused mid-phase or after stable promotion, create a short session note only if it adds information not already captured in `docs/PHASE_LOG.md`.

Use this shape:

```md
# Session Log - YYYY-MM-DD Session NN

## What Was Done
[one-line bullets]

## What Is In Progress
[one-line bullets, or "Nothing."]

## Current Version State
[version] - [phase] - [state] - [commit status]

## Open Decisions
[open decisions, or "None."]

## Known Issues
[known issues, or "None blocking."]

## Uncommitted Work
[file list, or "None. Working tree is clean."]

## Next Recommended Action
[one sentence]
```

Keep session logs short. Do not include full prompts, full validation output, or copied phase history.

---

## Handoff Discipline

`docs/AI_HANDOFF.md` should stay lean:

- Keep the current phase section short.
- Move detailed validation records to `docs/PHASE_LOG.md`.
- Keep the next phase action explicit.
- Do not duplicate full future plans; link to `docs/FUTURE_PLANS.md`.

The handoff doc should be useful at session start without becoming a second phase log.

---

## Commit and Promotion Discipline

After validation passes, the assistant response must include:

1. One PowerShell block containing all one-by-one `.\scripts\commit-phase.ps1` commands for pre-promotion changes.
2. One PowerShell block containing `.\scripts\promote.ps1 -Version "X.Y.Z"` when the phase is alpha and promotion is applicable.
3. One PowerShell block containing all one-by-one `.\scripts\commit-phase.ps1` commands for promotion changes.
4. One PowerShell block containing `git push origin master`.

Do not split those blocks across multiple AI turns.
