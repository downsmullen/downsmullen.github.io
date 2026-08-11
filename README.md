# downsmullen.github.io

Source for [downsmullen.com](https://downsmullen.com) — the consulting practice site of
Tim Downs Mullen.

> **Note:** this repository is public and GitHub Pages serves every file in it, including
> this README, at `downsmullen.com/<path>`. Treat everything here as buyer-visible.

## Intent

The public face of the consulting practice: systems engineering and Agile architecture for
regulated environments, and AI adopted under engineering control. The site carries the
evidence a prospect asks for — a case study, field reports on AI governance from real
projects, the 5 C's methodology, and a plain-English guide for practices and professional
firms evaluating the fixed-fee AI + HIPAA readiness assessment.

## Site structure

| Page | Purpose |
|:-----|:--------|
| `index.html` | Landing page — positioning, capabilities, credentials, insights grid |
| `about.html` | Longer-form background and how an engagement works |
| `agile-without-the-words.html` | Practitioner essay — what survived on a certified program, and the test that sorts practice from ritual |
| `ai-client-data-practices.html` | Plain-English guide — where client data goes when staff use AI |
| `externalized-memory.html` | Field report — externalized memory for stateless AI agents (shipped as a StrictLock module) |
| `plan-gate.html` | Field report — fail-closed AI agent governance (plan-gate / StrictLock) |
| `multi-agent-handoff-protocol.html` | Field report — what breaks when two agents share state |
| `case-study-transamerica.html` | Enterprise case study — Transamerica 'One Desktop' |
| `5c-framework.html` | The 5 C's methodology |
| `5c-presentation.html` | The 5 C's as a static slide walkthrough |
| `presentation.html` | Interview deck (impress.js, with a static mobile fallback) |
| `404.html` | Not-found page |

## Tech stack

- **Static HTML/CSS** — no framework, no build step, no dependencies
- **GitHub Pages** — push to `main` deploys automatically
- **Custom domain** — `downsmullen.com` via CNAME

## Development

```bash
# Clone
git clone https://github.com/downsmullen/downsmullen.github.io.git

# Local preview
python3 -m http.server 8000

# Deploy — this publishes immediately
git push origin main
```

Check every change at a 375px viewport before merging. The two worst defects this site has
shipped were mobile-only and invisible to desktop review.
