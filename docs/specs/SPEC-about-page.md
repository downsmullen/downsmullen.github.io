# SPEC — About + Engagement page (`about.html`)

**Status:** design spec, ready to build. Copy direction included; final copy is Tim-ruled before merge (merge = live deploy).
**Builder note:** this repo is public and served by GitHub Pages — this spec itself is public. No build step; each page carries its own inline CSS.

## Purpose

The site currently has no page where a wary buyer can size Tim up as a person. The nav item "Background" points to `presentation.html`, an interview slide deck written for hiring managers — the one off-message click on an otherwise buyer-facing site. This page replaces it in the nav.

Two audiences, one page:
1. **Regulated-industry engineering leader** deciding whether to bring in a consultant for AI-augmented SDLC / compliance-heavy Agile work.
2. **Practice manager / professional-firm owner** deciding whether to trust Tim with their AI + HIPAA exposure (fixed-fee assessment lane).

Both buy the *person* before the capability matrix. The page's job is trust, then a clear picture of what working together looks like.

## Nav change (all pages that carry the site nav)

- `index.html` nav: `<a href="presentation.html">Background</a>` → `<a href="about.html">About</a>`.
- Check every other page's nav/return links for a "Background" label and update to match (grep for `presentation.html` and `Background`).
- `presentation.html` stays live at its URL (interview use), no longer in the nav. It gets its own redesign (see `SPEC-interview-deck.md`).

## Voice rule (applies to every section)

Same story as the deck — USMC → avionics → enterprise transformation → founder — but every beat ends in **what this means for you**, not what Tim did. The deck says "Directed full life-cycle development for AIMS and Flight Management Systems"; this page says why a person who certified flight software is the person you want checking work nobody can afford to get wrong.

First person ("I"), plain sentences, no résumé voice. The register of the existing field reports (`plan-gate.html`, `externalized-memory.html`) is the model — direct, concrete, a little wry — not the register of the index hero.

## Structure (top to bottom)

1. **Hero one-liner.** Working direction: a single sentence bridging the site's promise to the person. e.g. "I've spent 25 years in rooms where a software mistake isn't an inconvenience — it's a grounded fleet or a federal violation." (Draft; Tim rules final.)
2. **Narrative arc — four beats,** each a short section (2–4 sentences + one "what this means for you" line):
   - **Foundation — U.S. Marine Corps.** Strategic alignment, decentralized execution, empowering the lowest level. → *Means for you:* someone who builds teams that execute without being micromanaged.
   - **Execution — Rockwell Collins / Intermec.** Avionics & FMS lifecycle (AIMS, Flight Management Systems); DO-178B/C, DO-254, EAR/ITAR (JCL2). → *Means for you:* discipline formed where "it works on my machine" is not an acceptable answer.
   - **Transformation — Collins Aerospace / Transamerica.** Agile coaching in regulated enterprises; $25M+ lifecycle portfolios; teams of 9–15; 25% schedule reduction; 2.5x velocity; EVMS variance under 5%; the 5 C's framework. → *Means for you:* speed and compliance are not a trade-off if the system is designed right.
   - **Now — Founder, TDM Technologies.** AI-augmented SDLC under engineering control; multi-agent architecture with audit trails; HIPAAPath; StrictLock. → *Means for you:* the same certify-it-or-it-doesn't-ship discipline, applied to the AI tools entering your business right now.
3. **Credentials strip.** Reuse the exact pattern and copy at `index.html:576` ("25 years in software — 21 in regulated industries…"). Keep the copy in sync — one source of truth; do not reword it here.
4. **"How an engagement works"** — the section the site has never had. Two lane cards, mirroring the two lanes on index:
   - **Engineering / AI-SDLC consulting** — scope shapes (embedded coaching, transformation, AI-adoption under engineering control), typical cadence, what the working artifacts look like (published SOPs, audit trail).
   - **AI + HIPAA readiness assessment (fixed fee)** — the shape of the box: what gets examined (where regulated data actually flows), roughly how long it takes, the deliverable (prioritized, plain-English fix list). Do NOT invent a price or a duration Tim hasn't stated — leave `[Tim: timeline]` / `[Tim: fee posture]` placeholders for his ruling.
   - Each lane card ends in its CTA: mailto for engineering; the existing assessment mailto (`index.html:607`) for the practice lane.
5. **Testimonial pull-through.** One of the two existing testimonials from `index.html:667-676` (the "you speak both tech and biz" one fits the trust job best), same card styling.
6. **CTA block.** Same pattern as the index footer: heading + mailto button + plain-text email.
7. **Quiet deck link.** One muted line near the footer: "Prefer the 5-minute slide version? → `presentation.html`".
8. **Footer link strip** identical to index (`GitHub / StrictLock / npm / HIPAAPath / LinkedIn`).

## Facts inventory (every claim must trace here — no new facts without Tim)

All sourced from current live copy (`index.html`, `presentation.html`):
USMC · Rockwell Collins & Intermec · AIMS / IMS-3500 / Flight Management Systems · DO-178B/C, DO-254, ARP4754 · EAR/ITAR export compliance, Export Classification Lead, JCL2 · Collins Aerospace & Transamerica · Agile coach/Scrum Master, Lean, TDD · $25M+ lifecycle portfolios · teams of 9–15 · 13-member core team, 300+ matrixed stakeholders, 5-year lifecycle (AIMS/IMS-3500) · 25% schedule reduction · 2.5x velocity · EVMS CAM, variance <5%, $10M+ PMB · 25 years software / 21 regulated · 5 C's framework · Transamerica "One Desktop," Best New Initiative award · TDM Technologies · HIPAAPath · StrictLock / eslint-plugin-strictlock · NIST SP 800-66.

## Design language

Copy the `:root` block and component patterns from `index.html` verbatim:
`--primary-dark: #0a192f; --primary-light: #112240; --accent: #64ffda; --text-main: #ccd6f6; --text-muted: #a8b2d1; --bg-white: #ffffff; --text-dark: #0f172a;` — Inter (Google Fonts, weights 300/400/600/800), fixed blurred nav, section padding `6rem 10%`, card patterns from `.service-card` / `.testimonial-card`, mobile menu toggle script from the bottom of index. Inline `<style>` per page, no shared stylesheet (current convention — CSS extraction is a separate backlog item, AT-003).

## SEO / head mechanics

- `<title>About | Tim Downs Mullen</title>`; meta description written for the buyer ("Why an avionics engineer…").
- og/twitter tags + Person JSON-LD following `index.html:6-30` exactly (og:url `https://downsmullen.com/about.html`, image `TDM.Monogram.webp`).
- Add to `sitemap.xml` (see `SPEC-analytics-and-hygiene.md`).

## Acceptance checklist

- [ ] Nav on every page says "About" → `about.html`; no nav anywhere still links `presentation.html`.
- [ ] `presentation.html` still reachable directly and from the quiet link.
- [ ] Visual parity: side-by-side with index in a browser — same nav, fonts, palette, card feel; mobile menu toggle works.
- [ ] Every factual claim traceable to the facts inventory; `[Tim: …]` placeholders resolved by Tim before merge.
- [ ] Copy approved by Tim before merge (content change → not autonomous).
- [ ] Page validates: no console errors, links resolve, `python3 -m http.server 8000` eyeball pass.
