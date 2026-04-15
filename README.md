# downsmullen.github.io

Personal consulting website for Tim Downs-Mullen — [downsmullen.com](https://downsmullen.com)

## Intent

Establish a professional web presence for the job search and consulting pipeline. The site houses case studies, the 5C Framework methodology, STAR interview examples, and an executive brief — all targeted at potential employers and clients evaluating Tim's Agile, aerospace, and AI workflow expertise.

## Site Structure

| Page | Purpose |
|:-----|:--------|
| `index.html` | Landing page — bio, navigation, value proposition |
| `5c-framework.html` | Original 5C consulting methodology |
| `5c-presentation.html` | Interactive executive brief (Prezi replacement) |
| `case-study-transamerica.html` | Enterprise case study — Transamerica engagement |
| `multi-agent-handoff-protocol.html` | Technical deep-dive — AI multi-agent coordination |
| `presentation.html` | Slide-style presentation page |

## Tech Stack

- **Static HTML/CSS** — no framework, no build step
- **GitHub Pages** — push to `main` deploys automatically
- **Custom domain** — `downsmullen.com` via CNAME

## Development

```bash
# Clone
git clone https://github.com/downsmullen/downsmullen.github.io.git

# Local preview
open index.html
# or use any local server: python -m http.server 8000

# Deploy
git push origin main  # GitHub Pages auto-deploys
```

## Project Management

This project follows the TDM ESOP standard. Key files:

- `HANDOFF.md` — Session state transfer (read on startup)
- `WORKPACKAGE.md` — CLI execution plans
- `_Tasks.md` — Local backlog with task sizing
- `_Kanban.md` — WIP tracker
- `state.json` — Project metadata blackboard
- `RETRO.md` — Friction log and lessons learned
- `docs/ENGINEERING_INTENT_JOURNAL.md` — IP/human authorship documentation
