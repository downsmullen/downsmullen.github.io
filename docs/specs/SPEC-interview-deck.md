# SPEC — Interview deck redesign (`presentation.html`)

**Status:** design spec, ready to build. Still interview-facing; same URL. Copy is Tim-ruled before merge.
**Builder note:** public repo; this spec is public. The deck leaves the site nav (see `SPEC-about-page.md`) but stays live for direct use in interviews and as the "5-minute slide version" linked from the About page.

## Why redesign

Three problems with the current deck:
1. **Content stops in the Transamerica era.** No TDM Technologies, no AI-augmented SDLC, no HIPAAPath/StrictLock — the entire "AI & Automation" column of the index capabilities matrix (`index.html:648-657`) is absent. In a 2026 interview that's the headline, not a footnote.
2. **Off-brand.** Courier monospace, GitHub-dark palette (`#0d1117`/`#58a6ff`) — reads as a different site when screen-shared next to downsmullen.com.
3. **CDN dependency.** impress.js loads from jsdelivr at present-time. Interview + conference wifi + third-party CDN = a live failure mode. The current `impress-not-supported` fallback also silently shows nothing on desktop if the script fails.

## Content — four acts (was three)

Keep the lifecycle frame ("Foundation → Execution → Transformation"), extend it:

1. **Foundation — U.S. Marine Corps.** Keep current bullets (strategic alignment, decentralized execution / 5 C's, sustainable velocity).
2. **Execution — Rockwell Collins & Intermec.** Keep current bullets (AIMS/FMS lifecycle; DO-178B/C, DO-254, EAR/ITAR JCL2).
3. **Transformation — Collins Aerospace & Transamerica.** Keep current bullets ($25M+ portfolios, 9–15 engineers, 25% schedule reduction, 2.5x velocity, Lean/TDD, building teams).
4. **NEW: AI Under Engineering Control — TDM Technologies (Founder).** Bullets drawn from index copy, e.g.:
   - AI-assisted SDLC where every work package has a published SOP and a git-verifiable audit trail (`index.html:602`).
   - Multi-agent orchestration, MCP servers & hooks, context engineering, agent handoff protocols (`index.html:648-657`).
   - Shipping products: HIPAAPath (audit-ready HIPAA documentation), StrictLock (published eslint plugin on npm).
   - IP authorship ledger structured for US Copyright Office registration.
5. **Closing slide (updated "current").** Retitle from "Engineering Leader | Avionics & Systems Execution" to span the whole arc — avionics discipline + AI-era execution. Skills line should mirror the four index matrix columns (Methodologies / Compliance & Security / Engineering Stack / AI & Automation) rather than only the avionics-era set. Exact wording: Tim rules.

The overview slide's subtitle becomes "Foundation → Execution → Transformation → AI Under Engineering Control" (or a Tim-ruled variant).

## Mechanics — recommendation: vendor impress.js, don't rebuild

**Recommendation with rationale:** keep impress.js and vendor it into the repo (commit `impress.js` v2.0.0, ~40KB, MIT-licensed, at e.g. `/js/impress.js`). The spatial zoom is memorable in an interview setting — it *is* part of the impression — and the mobile static fallback pattern already handles small screens. Rebuilding a keyboard-slide mechanic saves nothing (the file is tiny and stable) and loses the effect.
Flag for Tim only if he'd rather drop the zoom entirely; default is vendor-and-keep.

Additional mechanical fixes:
- Add a **desktop no-JS/failed-JS fallback**: if `impress` fails to init, un-hide the mobile static version instead of showing an empty page (small inline try/catch or `onerror` toggle).
- Keep: mobile static fallback, `← downsmullen.com` return link, spacebar/arrow hint, footer link strip (GitHub / StrictLock / npm / HIPAAPath / LinkedIn).
- Mobile fallback content must be regenerated to match the new four-act content (it duplicates every slide today — keep that 1:1 duplication rule).

## Design language

Restyle to the site system (same tokens as `index.html:33-41`):
- Font: Inter (300/400/600/800) — replaces Courier.
- Palette: `--primary-dark #0a192f` background, `--primary-light #112240` cards, `--accent #64ffda` highlights/borders, `--text-main #ccd6f6`, `--text-muted #a8b2d1`.
- Slide cards keep the current dim-inactive / glow-active behavior, recolored to the accent.
- Title/step typography can stay large; borrow heading weights from index (800 for h1).

## Head/meta

Update meta description + og/twitter copy to mention the four-act arc; og:url stays `https://downsmullen.com/presentation.html`. Add to sitemap.

## Acceptance checklist

- [ ] No external script/CDN requests except Google Fonts (matching the rest of the site). Deck works with wifi off (fonts fall back to system sans).
- [ ] Four acts + closing slide present in both the impress version and the mobile static fallback, content identical.
- [ ] JS-failure on desktop shows the static fallback, not a blank page.
- [ ] Visual parity with site system when screen-shared next to index.
- [ ] Keyboard nav (space/arrows) works; mobile (≤768px) shows scrollable static version.
- [ ] All new claims traceable to index copy (facts inventory in `SPEC-about-page.md` applies); final copy Tim-ruled before merge.
