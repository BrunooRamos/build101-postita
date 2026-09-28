# build 101 — SEO & AEO Optimization Plan

> **Nota histórica:** este plan se escribió cuando el evento se llamaba **UruHack** (`uruhack.uy`, 29–30 ago 2026). Hoy es **build 101** en `build101.dev`, el 17 y 18 de octubre de 2026 en FIUM · LATU. Las menciones a UruHack, fechas y sede de abajo son de esa versión; la fuente de verdad actual es `app/event.ts`. De los pendientes de abajo, los perfiles sociales (`sameAs`) ya están cargados en `SOCIALS`; el pin exacto de la sede sigue pendiente.

*Audit of the `redesign` branch (Next.js 16.2.9, fully static build), 2026-07-01.*

> **Estado (2026-07-01): todos los ítems de código están implementados** — C2–C6, P1.1–P1.4 (sin analytics), P2 (llms.txt, robots policy, viewport/manifest, `<time>`, sitemap `lastModified` desde `CONTENT_UPDATED_ISO`). Los assets (OG card, favicon, apple-icon) ahora se **generan en build** (`app/opengraph-image.tsx`, `app/icon.tsx`, `app/apple-icon.tsx`) — no hay más screenshots viejos. Quedan pendientes: **C1 (deploy + DNS)**, P0.4 (GSC/Bing), P1.5 (analytics), P3 (off-page), y los `TODO(uruhack)` en `app/event.ts` (fecha real de apertura de inscripción, pin exacto de la sede, perfiles sociales para `sameAs`).

Goal: when someone — or an answer engine (Google AI Overviews, ChatGPT Search, Perplexity, Claude, Gemini) — asks *"¿qué hackathones hay en Uruguay en 2026?"*, *"¿qué es UruHack?"*, *"hackathon Montevideo"*, the answer is UruHack, with correct date/venue/price, citing `uruhack.uy`.

---

## 1. Current state

### What's already strong (keep)

- **Fully static, server-rendered HTML.** The entire content — hero, tracks, agenda, venue, all 13 FAQs — is in the initial HTML payload (verified in `.next/server/app/index.html`). This is the single most important AEO property: GPTBot, ClaudeBot and PerplexityBot do **not** execute JavaScript, and they get everything.
- `.reveal` scroll animations are pure CSS and fail open (`app/globals.css:959`) — no content hidden without JS.
- Solid metadata in `app/layout.tsx`: title (57 chars), description, canonical, `metadataBase`, OG + Twitter cards, robots directives, `es_UY` locale.
- JSON-LD `@graph` with `Organization` + `WebSite` + `Event` (`app/components/StructuredData.tsx`), including free-price offer, location, ISO dates, audience.
- `robots.ts` + `sitemap.ts` emit clean `robots.txt` / `sitemap.xml`.
- Single `<h1>`, semantic sections with stable anchor ids (`#tracks`, `#build`, `#faq`), FAQ in native `<details>`.
- Fonts self-hosted via `next/font` (no third-party font requests); text-first hero → good LCP.
- Single source of truth for event facts (`app/event.ts`) — makes every fix below cheap.

### Critical issues

| # | Issue | Where |
|---|-------|-------|
| C1 | **Domain is not live.** `uruhack.uy` has no A records and no NS delegation. Nothing else in this plan matters until the site is deployed and resolvable. | DNS |
| C2 | **OG/Twitter image is a stale screenshot of the old design** — a nearly blank grid with the old nav ("// qué es // el viaje // fechas") and old CTA. For a hackathon, WhatsApp/Twitter/Instagram shares are the #1 distribution channel, and every share currently renders as an empty white card. `twitter-image.png` is byte-identical. | `app/opengraph-image.png`, `app/twitter-image.png` |
| C3 | **No `FAQPage` structured data** despite 13 high-quality Q&As. This is the highest-leverage AEO gap: FAQ schema is precisely the format answer engines extract. (Honest caveat: Google no longer *displays* FAQ rich results for most sites since Aug 2023, but the markup still feeds Bing — which grounds ChatGPT Search — and LLM crawlers.) | `app/components/FAQ.tsx` |
| C4 | **`og:image:alt` / `twitter:image:alt` are silently dropped.** The file conventions `opengraph-image.png` / `twitter-image.png` override the `openGraph.images` metadata objects in `layout.tsx` (verified in built HTML — no alt rendered). The `images` entries in `layout.tsx` are dead config. | `app/layout.tsx:72-91` |
| C5 | **Placeholder content ships in production HTML**: sponsor marquee renders literal "Logo" ×14; Mentors section renders 6 × "Por anunciar". Crawlers index this; snippets and LLM summaries can quote it ("sponsors: Logo, Logo, Logo"). | `Hero.tsx:7`, `Mentors.tsx:13-20` |
| C6 | **Stale/contradictory content in the terminal easter egg**: `tracks` command outputs "Fintech · IA aplicada · Salud & Bienestar · Open — cada uno con sponsor y premio propios", which contradicts the real Tracks section (one General track; sponsor tracks TBA). `sponsors` names "Embajada de EE.UU." while the visible page shows placeholders. Client-only so mostly invisible to crawlers, but it's a factual-consistency landmine for anyone quoting the site. | `Terminal.tsx:140-150` |

### Notable but non-critical

- `hyatt-exterior.jpg` is **920 KB for 1280×711** (should be ~80 KB as WebP). `logo.png` is 176 KB (it's the `Organization.logo` in JSON-LD). `icon.png` is a 1616×1616 / 72 KB favicon.
- Venue `<img>`s have no `width`/`height` attributes (CLS risk when they load).
- Canonical renders as `https://uruhack.uy` but the sitemap URL is `https://uruhack.uy/` — harmless for the root URL, but pick one form.
- `hreflang` has only a self-referencing `es-UY`, no `x-default`.
- `<h1>` ("Construí un producto real, en 24 horas.") contains none of the entity terms — no "UruHack", "hackathon", "Montevideo". The kicker above it ("La hackathon más grande de Uruguay.") is a `<div>`, invisible to outline extraction.
- FAQ questions are `<span>`s inside `<summary>` — not headings.
- No analytics of any kind → no way to measure any of this plan.
- No `viewport`/`themeColor` export, no web manifest (minor).
- 13 unused components (`Prizes`, `Stats`, `Sponsors`, `GitLog`, `CIChecks`, `SignupForm`, `SpotsCounter`, `Scramble`, `GlitchText`, `Spotlight`, `HeroFX`, `Tilt`, `Cursor`) — dead code, not an SEO issue, but repo hygiene.

---

## 2. P0 — Launch blockers (do before/at deploy)

### P0.1 Deploy + domain
- Register/delegate `uruhack.uy`, deploy (Vercel or similar), HTTPS.
- Decide canonical host: **apex `uruhack.uy`** (matches all metadata). 301 `www.uruhack.uy` → apex.
- Verify `https://uruhack.uy/robots.txt`, `/sitemap.xml`, `/opengraph-image.png` serve correctly.

### P0.2 New social card (replaces C2)
Design one real card and use it for both files:
- Content: UruHack logo + "Hackathon de 24 horas" + "29–30 ago 2026 · Hyatt Centric, Montevideo" + "Gratis · cupos limitados". Dark or brand-blue background, large type — must be legible at 400 px wide.
- Spec: **1200×630 PNG (or JPG), under 300 KB** (WhatsApp reliably fetches small images; it is the primary share channel here).
- Add `app/opengraph-image.alt.txt` and `app/twitter-image.alt.txt` (this is the Next 16 way to set `og:image:alt` for file-convention images — fixes C4) with e.g. "UruHack 2026 — hackathon de 24 horas, 29–30 de agosto, Hyatt Centric Montevideo".
- Delete the now-dead `images` blocks from `openGraph`/`twitter` in `layout.tsx` (they're overridden), or keep them consistent — but don't ship two sources of truth.
- After deploy, force-refresh scrapers: Facebook Sharing Debugger, Twitter/X card validator, LinkedIn Post Inspector, and send a test WhatsApp message.

### P0.3 Placeholder hygiene (C5, C6)
- Hide the sponsor marquee until real logos exist (or replace "Logo" text with `aria-hidden` decorative blocks that don't produce text nodes). Alternative: one honest line — "Sponsors: anuncio próximamente".
- Either trim the Mentors section to just its announcement copy, or keep the ghost cards but move "Por anunciar" out of heading-like elements. Search snippets that say "Por anunciar ×6" look abandoned.
- Fix the terminal `tracks`/`sponsors` commands to match reality (General track + sponsor tracks TBA).

### P0.4 Search engine registration (day of launch)
- **Google Search Console**: add domain property (DNS TXT verification), submit sitemap.
- **Bing Webmaster Tools**: import from GSC. Bing matters disproportionately for AEO — ChatGPT Search grounds on Bing's index.
- Request indexing of `/` in both.

---

## 3. P1 — Structured data & on-page (first week)

### P1.1 FAQPage JSON-LD (C3) — biggest AEO win
- Refactor `FAQS` out of `FAQ.tsx` into a data module (e.g. `app/faqs.ts`) where each item has `q`, plain-text `aText`, and optionally rich `a: ReactNode` for rendering. Three answers are currently JSX — they need plain-text equivalents for the schema.
- Render the visible FAQ from it (unchanged UX) **and** add a `FAQPage` node to the `@graph` in `StructuredData.tsx`:

```
{ "@type": "FAQPage", "@id": ".../#faq",
  "mainEntity": [ { "@type": "Question", "name": q,
    "acceptedAnswer": { "@type": "Answer", "text": aText } }, ... ] }
```

- One source of truth means the schema can never drift from the visible text (a Google spam-policy requirement: schema content must match on-page content).

### P1.2 Enrich the Event node
Additions to `StructuredData.tsx` (data into `event.ts` where reusable):
- `offers.validFrom` (registration open date) — recommended for Google Event rich results and currently missing.
- `location.address`: add `addressRegion: "Montevideo"`, `postalCode: "11300"`; add `location.geo` (`GeoCoordinates`, approx. -34.916, -56.157 — verify pin for Hyatt Centric Montevideo).
- `image`: Google wants 16:9, 4:3 and 1:1 crops — generate three crops of the new social card and list all three.
- `Organization`: add `sameAs` array with every official profile (Instagram, X, LinkedIn, Luma page). This is how search engines and LLMs consolidate the entity. Add `contactPoint` and swap `logo` to an `ImageObject` with a compressed square logo (≥112×112).
- Optional, nice AEO touch: model the agenda as `subEvent`s (kickoff, build, demos & premiación) with real ISO times once confirmed.
- Validate with Google Rich Results Test + Schema.org validator after deploy.

### P1.3 On-page semantics
- **H1**: work the entity in — e.g. `UruHack: construí un producto real, en 24 horas.` — or promote the kicker into the `<h1>` as a prefix span. The exact-match query space ("hackathon", "Uruguay", "Montevideo") should intersect the H1 or at least H1+kicker as one heading.
- Make each FAQ question a heading: `<summary><h3 className="faq-q">…</h3></summary>` (valid HTML, no visual change with CSS reset). Answer engines and screen readers both read document outline.
- Wrap visible dates in `<time dateTime="2026-08-29">29–30 ago 2026</time>` (hero meta, inscripción, footer).
- Trim `SEO_DESCRIPTION` to ~155 chars with facts front-loaded: "Hackathon gratuito de 24 horas en Montevideo — 29 y 30 de agosto de 2026, Hyatt Centric. Equipos de 3 a 5. Inscripción individual, cupos limitados." (Current 246-char version gets truncated mid-sentence in SERPs.)
- Canonical consistency: make `sitemap.ts` use the same no-trailing-slash form Next renders for the canonical (or vice versa).
- `hreflang`: add `x-default` → same URL, or drop the `languages` block entirely (single-locale site; self-referencing es-UY alone adds nothing).

### P1.4 Media weight
- `hyatt-exterior.jpg`: recompress to WebP ≤ 100 KB; add explicit `width`/`height` to both venue `<img>`s (or switch to `next/image`).
- `logo.png`: export a compressed version (it's fetched by crawlers as the Organization logo).
- Favicon: keep `apple-icon.png` (fine at 8 KB); replace the 1616×1616 `icon.png` with a 512×512 (< 15 KB) and let Next serve it; optionally add a 32×32 `favicon.ico`.

### P1.5 Analytics (measurement precondition)
- Add privacy-friendly analytics (Vercel Analytics, Plausible, or Umami). Without it, none of this plan is measurable.
- Track outbound clicks to Luma (the real conversion) — e.g. a small event on the `InscribiteBtn` handler.
- Add UTM to the Luma URL (`?utm_source=uruhack.uy`) so Luma-side registrations attribute to the site.

---

## 4. P2 — AEO-specific extras

- **`/llms.txt`**: emerging convention answer-engine vendors increasingly read. Static markdown at the root summarizing: what UruHack is (one sentence), date, venue + address, price (gratis), team size, deadline, registration URL, contact. ~15 lines, generated from `event.ts` via a route handler so it never drifts.
- **robots.txt policy decision**: current `*` allow already admits GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Bingbot. For AEO that's exactly right — record the decision so nobody "hardens" robots.txt later and silently kills AI citations.
- **IndexNow** (Bing/Yandex instant indexing): fire on each deploy, or enable the host's built-in integration. Cheap freshness win for the engine that feeds ChatGPT.
- **Freshness discipline**: answer engines heavily weight recency for events. Every real announcement (tracks, mentores, sponsors, cronograma confirmado) should update the page **and** `lastModified` in `sitemap.ts` (make it a constant in `event.ts` bumped per content change, not a hardcoded date).
- **Key-facts block**: the hero meta already exposes Cuándo/Dónde; consider adding Precio (Gratis) and Cierre de inscripción to it — the five facts LLMs are asked for (what/when/where/cost/how-to-join) then all live in one extractable block plus the FAQ.
- `viewport` export with `themeColor` (light/dark) + minimal web manifest — completeness, mobile polish.

---

## 5. P3 — Off-page: authority & citations (ongoing)

For a brand-new domain, off-page is what actually decides rankings and AI citations. LLMs cite what *other* trusted sources corroborate.

1. **Luma event page** (`luma.com/2kxg61n8`): mirror the exact name "UruHack 2026", date, venue, and — critically — link back to `https://uruhack.uy`. It will outrank the site for weeks; make it a funnel, not a competitor.
2. **Social profiles**: create/claim Instagram, X, LinkedIn with identical name/logo/description linking to the site; list them all in `Organization.sameAs` (P1.2).
3. **Ecosystem backlinks** (each is both a link and an AEO citation source): university communities (UdelaR/FING, ORT, UM, UCU, UTEC clubs), CUTI, coworks/comunidades tech (MVD tech meetups, DevOps/JS/Python UY groups), sponsor sites (once announced — ask each sponsor for a link), Embassy/institutional partners, local tech media (Cromo/El Observador, El País tech) — a hackathon at the Hyatt with free entry is a legitimate story pitch.
4. **Event aggregators**: Luma discovery, eventbrite-style listings, hackathon directories (e.g. hackathons list sites, dev community calendars). Consistent NAP+date everywhere.
5. **Post-event page** (`/2026` or a results section): winners, photos, numbers ("X equipos, Y horas, Z proyectos"). This is the content that earns organic links and makes UruHack 2027 rank from day one. Plan it now; ship within a week of the event.

---

## 6. Measurement & validation

| What | Tool | Cadence |
|------|------|---------|
| Index coverage, queries, CTR | Google Search Console | weekly |
| Bing index + ChatGPT-grounding presence | Bing Webmaster Tools | weekly |
| Rich result eligibility (Event, FAQ) | Rich Results Test after every schema change | per deploy |
| Social cards | FB Debugger / X validator / WhatsApp test | per OG change |
| AI referrals | analytics referrers: `chatgpt.com`, `perplexity.ai`, `gemini.google.com`, `copilot.microsoft.com` | monthly |
| AEO spot-check | ask ChatGPT/Perplexity/Gemini "¿qué es UruHack?" / "hackathon Uruguay 2026" and check citation + fact accuracy | monthly, and after each announcement |
| CWV | Lighthouse + CrUX (once traffic exists) | monthly |

Success criteria (by event date): site is the #1 result for "uruhack" and "hackathon uruguay 2026"; Event rich result shows in Google; ChatGPT/Perplexity answer "¿qué es UruHack?" with correct date/venue/price citing uruhack.uy; social shares render the real card.

---

## 7. Explicitly out of scope / not recommended

- **Wikipedia/Wikidata entry**: premature before the first edition happens (notability).
- **English version of the site**: audience is Uruguayan; schema.org is language-neutral and LLMs translate. Revisit only if international sponsors need it.
- **Blog/content marketing**: overkill for a single event landing; the post-event results page covers the durable-content need.
- **`meta keywords`**: already present; ignored by Google, harmless — leave or delete, zero impact.
- **Blocking AI crawlers**: opposite of the goal.
