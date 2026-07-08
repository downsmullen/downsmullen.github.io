# SPEC — Practice-facing insight piece (article brief)

**Status:** content brief, ready to draft. All copy Tim-ruled before merge (this is outward-facing content).
**Builder note:** public repo; this brief is public.

## Why this page

The index sells a fixed-fee "AI + HIPAA Readiness for Small Practices & Professional Firms" assessment (`index.html:604-608`) with **zero supporting artifact**. All six Insights cards speak to engineers (avionics case studies, agent architecture field reports). A practice manager who clicks around finds nothing in their language — the lane has a storefront and no shelf. This piece is the proof artifact: it demonstrates the exact thinking the assessment sells.

## Working title (direction, Tim rules final)

"Where client data actually goes when your staff use AI — and what I look for in an assessment."

## Audience & register

Practice managers and professional-firm owners (medical, dental, legal, accounting, therapy). Assume zero technical vocabulary and zero HIPAA-legalese patience. Plain English, short paragraphs, concrete scenarios ("your front desk pastes a patient email into a chatbot to draft a reply"). This is a **new register for the site** — warmer and simpler than the engineer-facing field reports. No acronyms without a plain-word pairing on first use.

Honest, not fear-mongering: the frame is "your staff are already doing this because the tools are genuinely useful — here's how to get the benefit without the exposure," matching the tone of the index card.

## Structure

1. **Opening scenario** (3–4 sentences): a completely ordinary, sympathetic moment where client data leaves the building via an AI tool. No villain.
2. **3–4 concrete leak paths**, each: what it looks like day-to-day → where the data actually goes → why it matters. Candidate paths (writer picks 3–4, Tim rules):
   - Pasting client/patient text into free consumer chatbots (data may be retained/used for training depending on tier and settings).
   - AI features quietly embedded in tools already in use (email autocomplete/summarize, meeting transcribers, dictation apps).
   - Staff personal accounts vs. business accounts — same product, different data terms.
   - Browser extensions / "AI helpers" that read the whole screen, including the practice-management system.
3. **What HIPAA actually obligates** — short and plain: you don't have to ban AI; you have to know where PHI (patient information) flows, have agreements with vendors that touch it (Business Associate Agreements, in plain words), and be able to show your reasoning. Keep to what current site copy already claims (NIST SP 800-66 alignment is on the matrix, `index.html:633`); **no legal advice, no new regulatory claims** — this is an engineer's map, not counsel.
4. **The fix pattern** (prioritized, plain-English — a taste of the assessment deliverable): know what tools are in use → decide the allowed list → business tiers + agreements for anything touching client data → one page of rules staff will actually read → check it twice a year.
5. **Soft CTA**: "This is a compressed version of what a readiness assessment maps for your specific practice" → existing assessment mailto (`mailto:tim@downsmullen.com?subject=AI%20%2B%20HIPAA%20readiness`) → HIPAAPath mention as the productized path.

Length target: 900–1,400 words. A practice manager finishes it in one coffee.

## Page mechanics

- New HTML page at root (suggest `ai-client-data-practices.html`; Tim may rule a different slug), full site design language (tokens per `SPEC-about-page.md` § Design language), article layout modeled on the existing field-report pages (`plan-gate.html` is the structural reference).
- **New card in the index Insights grid** with type label `Plain-English Guide` (new type, styled like existing `.insight-type`). Card graphic: the CSS-gradient + glyph pattern used by the three newest cards.
- Cross-links: practice-readiness service card (`index.html:604-608`) gains a "Read: where client data actually goes →" link; the article links back to the assessment card and to hipaapath.com.
- Head/meta: description + og/twitter written for the practice audience; add to sitemap.

## Acceptance checklist

- [ ] A non-technical reader test: no unexplained acronym, no sentence requiring engineering context.
- [ ] No invented statistics, no named vendors disparaged, no legal-advice phrasing ("consult your counsel" posture where relevant).
- [ ] Every regulatory claim within what current site copy already asserts.
- [ ] Index card + cross-links in place; sitemap updated.
- [ ] Full copy approved by Tim before merge (outward-facing content).
