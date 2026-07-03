# Cinematic Redesign — Design Spec

**Date:** 2026-07-03
**Branch:** `revision`
**Source of truth for visuals:** `design_handoff_ronmeck_site/README.md` (tokens, sections, interaction specs) and `design_handoff_ronmeck_site/Ron Meck.dc.html` (pixel reference and behavioral spec). This document records the decisions for implementing that handoff in this codebase; where the two conflict, the handoff wins except for the deviations listed under **Deviations from the handoff**.

## Goal

Rebuild ronmeck.dev around the handoff's cinematic single-page design: boot overlay → hero with particle canvas → chaptered sections (Origin, Scale, The Work, Timeline, Patents, Field Notes, The Record, Transmit) → footer. Restyle all inner pages to the same design system so the whole site reads as one system.

## Decisions made during brainstorming

- **Scope: whole site.** Homepage rebuilt per the handoff; inner pages (`/work/*`, `/patents/*`, `/writing/*`, `/resume`, `404`) keep their content and structure but are reskinned with the new tokens.
- **`/contact` is removed** and redirects to `/#contact` via Astro `redirects` config. The homepage TRANSMIT section replaces it.
- **`/resume` stays** (reskinned). The Record section links to the existing `/Ron_Meck_Resume.pdf`.
- **Dark-only.** The light/dark toggle, `ThemeScript`, `darkMode: 'class'`, and all `dark:` variants are deleted. The Origin section's paper background is art direction, not a theme.
- **`ClientRouter` (view transitions) is removed.** The design's global listeners (custom cursor, scroll progress, reveal observer) are simpler and more robust with normal page loads.
- **Floating artifacts are cut.** The handoff's five physics-driven contact-section objects (credit card, dog tag, patent chip, mini terminal, coin) will not be built. TRANSMIT is the giant headline, decoded email, and mono links, centered. The physics spec remains in the handoff README if ever revisited.
- **Particle field is made more visible than the prototype** (see Deviations).
- **Deferred TODO: mouse-responsive particle field.** The hero canvas should eventually react to the cursor; ideas to be brainstormed in a future session. Not built in this revision.

## Approach

In-place rebuild on the `revision` branch (no parallel `/v2` route, no wholesale port of the prototype HTML). Static sections become Astro components; interactive pieces become React islands; prototype inline styles become Tailwind utilities plus a small set of CSS custom properties. Content stays driven by the existing content collections.

## 1. Foundation

### Tokens (`tailwind.config.mjs` + `src/styles/global.css`)

- Colors per handoff: `--bg` #0A0A0B (boot overlay #060607), `--ink` #EDEBE6, muted at 0.55/0.45/0.4 alpha, `--accent` #F5A524 (the only accent), paper set #E9E5DC / ink #141412 / accent-on-paper #8A6A1F & #B07C1E (Origin only), hairlines rgba(237,235,230,0.10–0.14) on dark and rgba(20,20,18,0.2) on paper. Selection: amber background, #0A0A0B text.
- Fonts via `@fontsource` (self-hosted, matching current pattern): **Archivo variable** (display/body; replaces Geist and Fraunces), **JetBrains Mono** (kept), **Instrument Serif** italic (new; hero subline and inline emphasis). Remove the Geist and Fraunces packages.
- Type scale, spacing, and layout per handoff: hero H1 `clamp(72px, 15.5vw, 260px)`, section H2 `clamp(40px, 5vw, 76px)`, content max-width 1200px, section padding 140px/40px, sharp corners everywhere (the only rounding allowed is on elements the handoff rounds).
- Global CSS carries: `[data-reveal]` base styles with `prefers-reduced-motion` escape, section-header pattern (mono `NN / NAME` eyebrow in accent + 1px flex rule + right-aligned mono meta), hairline utilities, smooth scrolling.

### Layout shell

- `BaseLayout.astro`: drop `ClientRouter` and theme machinery; keep title/description props.
- `Nav.astro` (rebuilt): fixed top, `mix-blend-mode: difference`, "RM." wordmark with amber period, mono 12px links WORK / PATENTS / WRITING / RESUME / CONTACT pointing at `/#work`, `/#patents`, `/#writing`, `/#resume`, `/#contact` (work from inner pages too). 2px amber scroll-progress bar fixed at the very top. Links collapse under ~700px.
- `Footer.astro` (rebuilt): hairline top, mono 11px — build line, live `SESSION UPTIME MM:SS` (1s tick, amber value), `SOUND · OFF/ON` toggle, copyright.

## 2. Homepage

`src/pages/index.astro` composes one Astro component per chapter from `src/components/home/`:

| Component | Content |
|---|---|
| `BootOverlay` | Fixed #060607 overlay, 5 staggered mono amber lines (0.1s→1.9s delays, 0.3s fade+8px rise), blinking block cursor, fades out ~2.6s then unmounts. Plays once per session (`sessionStorage`). Skipped entirely under reduced motion or no-JS (overlay never blocks content). |
| `HomeHero` | 100vh, content bottom-aligned; particle canvas + radial vignette behind. Eyebrow row (pulsing amber dot + AVAILABLE, location, lat/long), H1 "RON␤MECK", serif-italic subline left + mono descriptor right, marquee ticker at bottom (duplicated content, `translateX(0→-50%)` 28s linear, amber ◆ separators). |
| `Origin` | Paper section. 2-col: huge H2 with ochre period; two 19px paragraphs (Navy 1997 story, serif italic on "they don't get to fail."); mono footer row of service dates. |
| `Scale` | H2 + intro + 4 stat cells (1px-gap hairline grid) with count-up on first intersection (1600ms, easeOutQuart): $2T+, 60M, $30M, 75%. |
| `TheWork` | Two case-study cards from the `case-studies` collection: hairline border, mono header string, title, description, tag chips, amber "VIEW CASE STUDY →" linking to `/work/<slug>/`. CSS scanline sweep (5s/6.5s loops); hover border→amber + translateY(-4px). |
| `Timeline` | 10 rows from the `experience` collection, grid `180px 1fr 220px 110px` (years / role / org / category tag), hover amber-tint + left-pad slide. Stacks on mobile. |
| `Patents` | H2 + accordion island over the `patents` collection. |
| `FieldNotes` | 2-col: H2 left; paragraph + outlined mono button "READ THE WRITING →" to `/writing/`. |
| `TheRecord` | Outlined banner + solid amber "DOWNLOAD PDF RESUME ↓" → `/Ron_Meck_Resume.pdf`; also links `/resume`. |
| `Transmit` | 90vh centered: giant H2 "READY TO MODERNIZE YOUR ENTERPRISE?" (amber ?), decoded email link, mono LINKEDIN / GITHUB / PHONE links from `src/lib/site.ts`. No floating artifacts. |

**Copy:** narrative copy (Origin paragraphs, hero subline, ticker items, section intros) lives in the components, taken verbatim from the prototype. Collection-driven content (timeline rows, patents, case-study cards) is reconciled to the prototype's copy by editing frontmatter, extending schemas in `src/content/config.ts` where fields are missing (timeline category tag, work-card mono header string, patent tag string).

## 3. Interactive islands (`src/components/home/islands/`)

- **`ParticleField.tsx`** (`client:idle`) — canvas behind hero: ~80 points, velocity ±0.35px/frame, edge bounce, lines between pairs <130px, dots; devicePixelRatio-aware; pauses on `visibilitychange`. **Visibility bump over prototype:** line alpha `(1 - d/130) * 0.32` (prototype 0.22), dots 2.5×2.5px at 0.85 alpha (prototype 2×2 at 0.7). Values are starting points to be tuned visually — clearer, not overbearing.
- **`PatentAccordion.tsx`** (`client:visible`) — single-open accordion, patent data passed as props. Row grid `170px 1fr 40px` (mono amber number / bold title / +− toggle). Expanded panel (0.4s fade+rise): description, tag string, "VIEW PATENT DETAILS →" to `/patents/<slug>/`, decorative schematic (4 pulsing nodes joined by dashed amber lines, 2s pulse, 0.4s stagger).
- **`CustomCursor.tsx`** (`client:idle`) — mounts only on `pointer: fine`. 6px amber dot tracks exactly; 30px ring lerps at 0.16, grows to 52px over links/buttons. Native cursor hidden only while the island is active.
- **`EmailDecoder.tsx`** (`client:visible`) — email assembled from character codes at runtime; **never present in delivered HTML**. Shows masked `r*******@*****.***`, plays 1200ms left-to-right scramble-decode on scroll into view (unsettled chars cycle `#$%&@*+=?!<>/\0-9A-F`). `href` is a dummy anchor; real `mailto:` set in the click handler.

**Plain Astro `<script>`** (no React): shared `[data-reveal]` IntersectionObserver (threshold 0.12, 0.7s `cubic-bezier(0.16,1,0.3,1)`, `(index % 4) * 0.08s` stagger; first-viewport elements never hidden), boot overlay timing, scroll-progress bar, count-up stats, footer uptime, sound engine (lazy AudioContext on first gesture; sine blips 1400Hz link hover / 660Hz patent toggle / 880Hz enable confirm, 80ms exponential decay; off by default). Marquee and scanlines are pure CSS.

**framer-motion is not used** by this design; remove the dependency at the end if nothing else imports it.

**Reduced motion (global):** boot skipped, reveals instant, particles static/absent, marquee and scanlines static, count-ups show final values, cursor default.

## 4. Inner pages

- `/work/index` + `/work/[slug]`, `/patents/index` + `/patents/[slug]`, `/writing/index` + `/writing/[slug]`, `/resume`, `404`: keep structure and content; restyle with new tokens (Archivo uppercase heavy headlines, mono eyebrows in `NN / NAME` style, hairlines, sharp corners, amber accents, dark-only). Retune `@tailwindcss/typography` prose styles to the new palette for MDX bodies.
- `VDOTArchitectureDiagram.tsx` stays (case-study content, not design shell).
- `astro.config.mjs`: add `redirects: { '/contact': '/#contact' }`.

## 5. Deletions and survivors

Deleted: `ThemeScript.astro`, `MetricStrip.astro`, `StatusPill.astro`, `Hero.astro`, `src/pages/contact.astro`, Geist/Fraunces font packages, and (if unused) framer-motion.

Kept but restyled — still used by inner index pages: `PatentCard.astro` (`/patents/index`), `ExperienceTimeline.astro` and `CaseStudyVisual.astro` (`/work/index`). They adopt the new tokens during the inner-page reskin; the homepage stops importing them (its sections are new components).

## Deviations from the handoff

1. **Floating artifacts: cut** (user decision — tone).
2. **Particle field: more visible** than prototype values (user decision), tuned live.
3. **Custom cursor hiding:** `cursor: none` applied via the island rather than a global `* { cursor: none }` in static CSS, so touch/no-JS users keep a working cursor.
4. **Fonts self-hosted** via `@fontsource` instead of Google Fonts CDN (matches existing pattern; no visual difference).

## Deferred (explicitly not in this revision)

- **Mouse-responsive particle field** — future brainstorm + enhancement to `ParticleField.tsx`.
- Any light theme.

## Error handling

Progressive enhancement over static HTML. No JS: boot overlay skipped (never blocks), reveals visible, masked email placeholder shown, empty hero canvas. Each island guards its own mount conditions (pointer type, reduced motion). Boot overlay is time-boxed by CSS/JS timeouts, with no state that can wedge the page.

## Verification

- `astro build` and `astro check` pass.
- Browser pass at desktop and ~375px widths, side-by-side with `Ron Meck.dc.html`: every section, boot sequence (and its once-per-session behavior), anchor nav from inner pages, reduced-motion mode, sound toggle.
- `view-source` / built HTML contains no occurrence of the email address.
- No test framework added; the browser pass is the acceptance test.
