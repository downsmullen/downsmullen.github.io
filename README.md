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

## IndexNow (added 2026-10-05)

`3d4bf1177447d4fec60c001c5237f23b.txt` at the root is the IndexNow ownership key. It is **public by design**, not a secret: Bing, Yandex and other engines fetch it to confirm a submission came from this site. Google ignores IndexNow, but Bing's index feeds ChatGPT search and Copilot.

After publishing new or changed pages, tell the engines (edit the URL list):

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST https://www.bing.com/indexnow \
  -H "Content-Type: application/json; charset=utf-8" \
  -d '{"host":"downsmullen.com","key":"3d4bf1177447d4fec60c001c5237f23b","keyLocation":"https://downsmullen.com/3d4bf1177447d4fec60c001c5237f23b.txt","urlList":["https://downsmullen.com/"]}'
```

200 or 202 = accepted. Use Bing's own endpoint (above), not the shared `api.indexnow.org`: on 2026-10-05 pings sent there returned success but never showed up in Bing Webmaster Tools; a direct ping on 2026-10-10 appeared at once. Bing shares submissions with the other engines. Submit pages when they change, not on a timer. The key file must be live before the first submission.
