# Handoff: ronmeck.dev — Cinematic Redesign

## Overview
A full redesign of ronmeck.dev (personal resume/portfolio site for Ron Meck, Enterprise Architect). The new design is a single cinematic scrolling page that tells Ron's story in chapters: terminal boot intro → hero → origin (Navy, 1997) → scale (Capital One, $2T) → case studies → career timeline → patents → writing → resume → contact with an interactive floating-artifact field.

**Target codebase:** ronmeck.dev is built with **Astro v5 + React + Tailwind + TypeScript + MDX**. Implement this design in that stack.

## About the Design Files
`Ron Meck.dc.html` is a **design reference created in HTML** — a prototype showing intended look and behavior, NOT production code to copy directly. Recreate it in the Astro/React/Tailwind codebase using its established patterns:
- Static sections → Astro components; interactive pieces (particle canvas, patent accordion, floating artifacts, custom cursor) → React islands (`client:visible` / `client:idle`).
- Inline styles in the prototype → Tailwind utilities + a small set of CSS custom properties (tokens below).
- The prototype's JavaScript logic (one class) is a faithful behavioral spec — port the algorithms, don't ship the file.

## Fidelity
**High-fidelity.** Colors, typography, spacing, copy, and interaction physics are final intent. Recreate pixel-perfectly.

## Design Tokens
Colors:
- `--bg` #0A0A0B (page background; boot overlay uses #060607)
- `--ink` #EDEBE6 (primary text on dark)
- `--muted` rgba(237,235,230,0.55) — secondary text; 0.45/0.4 for captions
- `--accent` #F5A524 (CRT amber — the ONLY accent; used for rules, numbers, hovers, cursor). Alternates offered in design: #4ADE80, #6B8BFF, #FF4D2E
- `--paper` #E9E5DC with ink #141412 and accent-on-paper #8A6A1F / #B07C1E (Origin section only — the single light section)
- Hairlines: rgba(237,235,230,0.10–0.14) on dark; rgba(20,20,18,0.2) on paper
- Selection: background #F5A524, color #0A0A0B

Typography (Google Fonts):
- Display/body: **Archivo** variable (wdth 62–125, wght 100–900). Headlines: weight 800–900, font-stretch 115–125%, uppercase, letter-spacing -0.02/-0.03em, line-height 0.86–1.0
- Data/labels: **JetBrains Mono** 400/500/700 — all eyebrows, stats labels, nav, footer, tags. 11–13px, letter-spacing 0.08–0.14em, uppercase
- Accent italic: **Instrument Serif** italic — hero subline ("I design the systems money moves through."), inline emphasis in Origin copy

Type scale (key sizes):
- Hero H1: clamp(72px, 15.5vw, 260px)
- Section H2: clamp(40px, 5vw, 76px); contact H2: clamp(48px, 8vw, 130px)
- Stat numbers: clamp(44px, 4.5vw, 72px), weight 900
- Body: 19px/1.65 (feature paragraphs), 15–17px/1.6 (cards)

Spacing/layout:
- Content max-width 1200px, centered; section padding 140px 40px (120px for lighter sections)
- Section header pattern: mono eyebrow `NN / NAME` in accent + 1px flex rule + right-aligned mono meta
- Stats: 4-col grid, 1px gaps showing hairline background (border trick)
- Sharp corners everywhere (radius 0) except floating artifacts (card 12px, terminal 8px, coin/tag rounded)

## Screens / Sections (single page, in order)
1. **Boot overlay** — fixed, #060607, centered JetBrains Mono 14px/2.1 amber lines, 5 lines staggered in (0.1s→1.9s delays, 0.3s fade+8px rise each), blinking block cursor. Whole overlay fades out at ~2.6s (0.5s fade) then unmounts. Skip entirely on reduced-motion; consider sessionStorage to play once per session.
2. **Nav** — fixed top, `mix-blend-mode: difference`, "RM." wordmark (800, stretch 125%, amber period) left; right: mono 12px links WORK / PATENTS / WRITING / RESUME / CONTACT → in-page anchors (smooth scroll). 2px amber scroll-progress bar fixed at very top.
3. **Hero** (100vh, content bottom-aligned) — full-bleed `<canvas>` particle field behind (spec below) + radial vignette. Eyebrow row: pulsing amber dot + AVAILABLE, location, lat/long (mono, 12px). H1 "RON␤MECK". Below: serif-italic subline left, mono 13px descriptor right (max-width 340px). Bottom: marquee ticker (border-top hairline, mono 13px, ~28s linear loop, duplicated content for seamless wrap): `$2T+ ANNUAL VOLUME ◆ 60M MONTHLY USERS ◆ 4 US PATENTS ◆ 75% FASTER DELIVERY ◆ $30M REVENUE UNLOCKED` (amber ◆).
4. **01 / ORIGIN** — paper background (#E9E5DC). 2-col grid: left huge H2 "EVERY ARCHITECTURE HAS A FOUNDATION." (amber-ochre period), right two 19px paragraphs (Navy 1997 story; serif italic on "they don't get to fail.") + mono footer row: US NAVY · 1997 / US ARMY · 2002 / BANK OF AMERICA · 2008.
5. **02 / SCALE** — H2 "THEN THE NUMBERS GOT SERIOUS." + intro paragraph + 4 stat cells with **count-up animation** on scroll into view (1600ms, easeOutQuart): $2T+ ANNUAL VOLUME (amber number), 60M MONTHLY USERS, $30M REVENUE UNLOCKED / YR, 75% FASTER DELIVERY.
6. **03 / THE WORK** — two case-study cards (1px hairline border, 36px padding). Mono header (`CAPITAL ONE // ARCH_VISUAL_v1.2`), 32px title, description, mono tag chips (1px border, 5px 10px), amber "VIEW CASE STUDY →". A slow "scanline" gradient sweeps vertically through each card (5s/6.5s loop). Hover: border → amber, translateY(-4px). Links go to existing case-study pages.
7. **04 / TIMELINE** — 10 rows, grid `180px 1fr 220px 110px`: years (mono), role (700, clamp 18–26px), org, category tag (mono 10px, amber, amber-hairline border). Hover: amber-tint background + 12px left-pad slide. Data = full career 1997→now (see prototype for exact rows).
8. **05 / PATENTS** — H2 "SYSTEMS THAT RUN THEMSELVES." + 4 accordion rows: grid `170px 1fr 40px` — patent number (mono amber), title (700), +/− toggle. Expanded (one at a time): description, tag string, "VIEW PATENT DETAILS →" link, and a decorative animated schematic (4 pulsing nodes — filled circle / rotated square / outlined circle / filled square — joined by dashed amber lines; pulse 2s, staggered 0.4s). Expansion animates in (0.4s fade+rise).
9. **06 / FIELD NOTES** — 2-col: H2 left; right paragraph + outlined mono button "READ THE WRITING →" (hover: amber border+text).
10. **07 / THE RECORD** — outlined banner: "The full record, on paper." + mono skills line; right: solid amber button "DOWNLOAD PDF RESUME ↓" (dark text, hover translateY(-3px)) → /Ron_Meck_Resume.pdf.
11. **08 / TRANSMIT (contact)** — 90vh, centered. Giant H2 "READY TO MODERNIZE YOUR ENTERPRISE?" (amber ?), email link (spec below), mono links LINKEDIN / GITHUB / PHONE. Surrounding it: **floating artifacts** (spec below).
12. **Footer** — hairline top, mono 11px: `BUILD · main@dev / v2026.07` · `SESSION UPTIME · MM:SS · SYS NOMINAL` (live counter, 1s tick, amber value) · `SOUND · OFF` toggle button · `© 2026 RON MECK`.

## Interactions & Behavior

### Scroll reveals
All `[data-reveal]` elements below the fold start `opacity:0; translateY(28px)`, reveal via IntersectionObserver (threshold 0.12) with `0.7s cubic-bezier(0.16,1,0.3,1)`, staggered `(index % 4) * 0.08s`. Elements already in the first viewport never hide (no-JS safe). Respect `prefers-reduced-motion`.

### Hero particle field
Canvas, ~80 points, random velocity ±0.35px/frame, bounce off edges. Lines between pairs closer than 130px, alpha `(1 - d/130) * 0.22` in accent RGB; 2×2px accent dots at 0.7 alpha. devicePixelRatio-aware; pause when tab hidden.

### Custom cursor (desktop / pointer:fine only)
Hide native cursor (`* { cursor: none }`). 6px amber dot tracks mouse exactly; 30px amber ring (1px border, 0.6 opacity) follows with lerp factor 0.16. Ring grows to 52px over links/buttons (0.2s transition).

### Email anti-scrape
The address must NEVER appear in delivered HTML source (nor in this repo). Assemble it — `r******@g****.com`, chars per `EmailDecoder.tsx` — from character codes at runtime. Display: starts masked (`r*******@*****.***`), plays a scramble-decode on scroll into view (1200ms; left-to-right settle, unsettled chars cycle through `#$%&@*+=?!<>/\0-9A-F`). `href` is a dummy anchor; real `mailto:` set in the click handler.

### Floating artifacts (contact section) — the "wow" interaction
5 absolutely-positioned objects around the headline (desktop >900px + fine pointer only; hidden otherwise):
- Credit card 200×124 (chip, number `4323 7645 2828 0713`, `R MECK · $2T/YR`), top-left
- Navy dog tag 150×88 (`MECK, RON / US NAVY / 1997—2001`), top-right
- USPTO patent chip 130×130 (double inset border, `10,951,542 ×4 GRANTED`), bottom-left
- Mini terminal 190w (`$ uptime → 25y · 0 failures` + blinking cursor), bottom-right
- RM coin 96px circle, mid-left

Physics per frame (rAF): spring to home (`v += -pos * 0.015`, rotation spring 0.02), cursor repulsion within 300px radius (`force = (1-d/R)² * 3.2` away from cursor, plus rotational kick ×0.7), damping ×0.9, idle bob `sin(t*speed+phase) * 10–18px` + gentle sway rotation ±3°, each with base tilt (−10°…+7°). Hover on artifact: inner element scales 1.1–1.14 + counter-rotate (0.3s), deep shadow `0 20px 50px rgba(0,0,0,0.5)`.

### Sound (off by default)
Footer toggle. When ON: WebAudio sine blips — 1400Hz/0.02 gain on link hover, 660Hz on patent toggle, 880Hz confirm on enabling. 80ms exponential decay. Create AudioContext lazily on first user gesture.

### Misc
- Smooth scrolling for anchor nav (`scroll-behavior: smooth`)
- Marquee: duplicate content, `translateX(0 → -50%)` 28s linear infinite
- Session uptime: `setInterval` 1s, format MM:SS

## State Management
Client-side only, per island: boot visibility (2 timeouts), open patent index (single accordion), sound on/off, uptime seconds. No data fetching; all content static/MDX.

## Responsive notes
Prototype is desktop-first. For implementation: nav links collapse under ~700px; stats grid 4→2 cols; 2-col grids stack; timeline grid → stacked rows; floating artifacts and custom cursor disabled on touch. Headline sizes already fluid via clamp().

## Assets
No external images. Everything is type, CSS, and canvas. Fonts from Google Fonts: Archivo (variable wdth/wght), JetBrains Mono, Instrument Serif. Case study/patent/writing links point at existing ronmeck.dev pages.

## Files
- `Ron Meck.dc.html` — the full design reference (markup between `<x-dc>` tags = structure/styles; the `Component` class = complete behavioral spec for all animations and physics).
