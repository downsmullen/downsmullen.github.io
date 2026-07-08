# SPEC — Analytics + mechanical hygiene

**Status:** ready to build. Everything here is mechanical/internal except the analytics account (Tim's one external action). Favicon/404/sitemap/robots are visual-adjacent but content-free; per merge authority, treat the 404 page copy as Tim-ruled (it's outward-facing), the rest as autonomous-mergeable with a note.

## 1. Analytics — GoatCounter

**Why GoatCounter:** free for personal/small use, no cookies, no consent banner needed, one script tag, public or private dashboard — answers the actual question (does the practice lane or the engineering lane get traffic?) with zero privacy overhead.

**Tim's one action (external blocker):** create an account at goatcounter.com and pick a site code (suggest `downsmullen`). Everything else is mechanical.

Once the code exists, add to every HTML page, just before `</body>`:

```html
<script data-goatcounter="https://SITECODE.goatcounter.com/count"
        async src="//gc.zgo.at/count.js"></script>
```

- Pages: index, about (new), 5c-framework, 5c-presentation, case-study-transamerica, multi-agent-handoff-protocol, plan-gate, externalized-memory, presentation, the practice article (new), 404.
- Note: this adds one external script — the deck's "no CDN" acceptance rule (`SPEC-interview-deck.md`) refers to *render-critical* scripts; an async analytics tag failing changes nothing visually.
- Verify after deploy: visit two pages, confirm hits in the dashboard, confirm `presentation.html` vs `about.html` are distinguishable (path-level tracking is default).

## 2. Favicon

- Source: `TDM.Monogram.webp` (existing site asset).
- Generate: `favicon.ico` (32px) + `favicon-192.png` + `apple-touch-icon.png` (180px), committed at root. macOS: `sips` can resize; ico can be a single-size PNG-in-ico or just serve PNG links (all modern browsers accept `<link rel="icon" type="image/png">` — acceptable to skip .ico and ship PNG only).
- Add to every page's `<head>`:

```html
<link rel="icon" type="image/png" sizes="192x192" href="/favicon-192.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
```

## 3. 404 page

- `404.html` at root — GitHub Pages serves it automatically for unknown paths.
- Site design language (tokens per `SPEC-about-page.md`), minimal: nav (or just logo), "This page doesn't exist." + links to index and the Insights section. Copy is 2–3 lines; Tim rules it (outward-facing, but trivial — batch with any copy review).

## 4. sitemap.xml + robots.txt

`robots.txt` at root:

```
User-agent: *
Allow: /

Sitemap: https://downsmullen.com/sitemap.xml
```

`sitemap.xml` at root listing every public page (absolute `https://downsmullen.com/...` URLs): index, about, 5c-framework, 5c-presentation, case-study-transamerica, multi-agent-handoff-protocol, plan-gate, externalized-memory, presentation, practice article. Plain `<urlset>` with `<loc>` entries; omit priority/changefreq noise. **Keep in sync**: adding a page = adding a `<loc>` — note this in the sitemap file as an XML comment and in CLAUDE.md's site-map section if convenient.

Deliberately **not** listed: `docs/` specs and CLAUDE.md/README are tracked and technically fetchable — that's accepted (written-for-public policy) but they don't belong in the sitemap.

## Acceptance checklist

- [ ] GoatCounter tag on all pages once Tim supplies the site code (blocked until then; everything else can ship first).
- [ ] Favicon renders in a browser tab on at least index + one article page.
- [ ] `https://downsmullen.com/definitely-not-a-page` renders the styled 404.
- [ ] `sitemap.xml` fetches, lists all public pages incl. new ones; `robots.txt` fetches and points at it.
- [ ] No page's HTML validates worse than before (quick console check per page).
