# downsmullen.com — Claude instructions

Tim's public consulting site. Static HTML/CSS, no framework, no build step.
**Push to `main` = live deploy** (GitHub Pages, custom domain via CNAME).
Repo: downsmullen/downsmullen.github.io.

> Rewritten 2026-07-07. The previous version was a Windows-era ESOP template pointing at
> files (HANDOFF.md, WORKPACKAGE.md, _Tasks.md, …) that never existed in this repo. There is
> no HANDOFF.md — do not hunt for one.

## How work runs here (EA-OS loop)

- **Session state lives in the TDM vault, not this repo** — the portfolio card
  `portfolio/downsmullen-site.md` and vault memory are the durable trail; the vault
  handoff/resume skills read and write them.
- Work on a branch (`pub/<topic>` for site content, `chore/<topic>` for internal), then
  merge to `main`. **Merging publishes to the live site.**
- **Copy, content, and visual changes are Tim's call — get his approval before merge.**
  Docs-only/internal changes (CLAUDE.md, README, .gitignore) may merge autonomously; say so.
- Preview locally: `open index.html` or `python3 -m http.server 8000`. No CI; eyeball the
  page before merging.
- Tim is deaf — anything audio needs visual-first design and a hearing person for sign-off.
- No secrets in any file, ever (static public repo).

## Site map

index, 5c-framework, 5c-presentation, case-study-transamerica,
multi-agent-handoff-protocol, plan-gate, externalized-memory, presentation — all `.html`
at root. Assets at root. README.md has the page-purpose table.
