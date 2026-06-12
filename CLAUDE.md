# Website — Claude Context Anchor

Read HANDOFF.md and WORKPACKAGE.md on startup. This is a GitHub Pages static site. Push to main deploys automatically.

## Project Context

- **Domain:** downsmullen.com (GitHub Pages, CNAME configured)
- **Repo:** downsmullen/downsmullen.github.io (independent repo, not a vault submodule — DEC-001)
- **Stack:** Static HTML/CSS, no framework, no build step
- **Pages:** 8 HTML files (index, 5c-framework, 5c-presentation, case-study-transamerica, multi-agent-handoff-protocol, plan-gate, externalized-memory, presentation)

## Compliance

- **ESOP Mandatory 6:** All present (_Tasks.md, _Kanban.md, state.json, CLAUDE.md, README.md, .gitignore)
- **SOP-001 (ISMS):** Pre-commit secret scanner hook installed. No secrets in this repo (static HTML).
- **SOP-002 (CI):** Lessons captured in RETRO.md. No instincts.db yet — using markdown capture.
- **IP Documentation:** Engineering Intent Journal at `docs/ENGINEERING_INTENT_JOURNAL.md`. Update BEFORE each AI-assisted sprint.

## Active Threads

See HANDOFF.md for current state. Key backlog items: CSS extraction (AT-003), AI consulting lane evaluation (AT-002).

**Close-out is part of the work.** Per EA-OS Session Protocol point 4, a work package is not done until `HANDOFF.md` Meta is refreshed, Next Action is refreshed, completed Active Threads are moved to `HANDOFF_ARCHIVE.md`, and a close-out commit lands. Report "done" only after the close-out commit.
