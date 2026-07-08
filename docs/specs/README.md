# Site work packages — specs

Design specs produced 2026-07-07 (spec session; builds handed to separate sessions). Each spec is self-contained: a fresh session should be able to build from the spec + the live repo without the originating conversation.

| Spec | Builds | Copy approval |
|---|---|---|
| [SPEC-about-page.md](SPEC-about-page.md) | `about.html` + nav change site-wide ("Background" → "About") | Tim-ruled before merge |
| [SPEC-interview-deck.md](SPEC-interview-deck.md) | `presentation.html` redesign (4th act, site design language, vendored impress.js) | Tim-ruled before merge |
| [SPEC-insight-practice-piece.md](SPEC-insight-practice-piece.md) | practice-facing article + index Insights card | Tim-ruled before merge |
| [SPEC-analytics-and-hygiene.md](SPEC-analytics-and-hygiene.md) | GoatCounter tag, favicon, 404, sitemap, robots | Mostly autonomous; GoatCounter account is Tim's action; 404 copy Tim-ruled |

Suggested build order: hygiene (no dependencies) → about page (unblocks nav change) → deck → article. Analytics tag last, once the GoatCounter site code exists.

Repo rules: merge to `main` = live deploy; copy/content/visual changes need Tim's approval before merge (see CLAUDE.md).
