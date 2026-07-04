# Resume: Dual PDF Downloads + Terminal-Themed HTML Resume — Design Spec

**Date:** 2026-07-04
**Branch:** current working branch
**Builds on:** `2026-07-03-cinematic-redesign-design.md` (design tokens, `ParticleField`, `Greebles`/boot chrome, paper tokens).

## Goal

Two PDF resumes now exist in `public/`: a standard resume (`Ron_Meck_Enterprise_Architect_Resume.pdf`) and a new ATS-friendly version (`Ron_Meck_Enterprise_AI_Architect_ATS.pdf`). Give visitors a way to download either from "The Record" section, and re-theme the HTML resume page (`/resume`) so it matches the rest of the site instead of standing apart as a plain white print page.

## Decisions made during brainstorming

- **`public/Ron_Meck_Resume.pdf` (Apr 28) is stale** — superseded by `Ron_Meck_Enterprise_Architect_Resume.pdf`. It is deleted; `site.ts` repoints to the new file. This also finishes a change the cinematic-redesign spec already called for (its `TheRecord` row already names `Ron_Meck_Enterprise_Architect_Resume.pdf`) but that hadn't landed in code yet.
- **Two download options, two buttons.** No dropdown/toggle — a solid amber button for the standard resume and an outline button for the ATS version, reusing the existing `.btn-solid` / `.btn-outline` classes. No new JS.
- **The HTML resume page is a "terminal readout," not a paper page.** On screen it adopts the site's dark `surface`/`ink`/`accent` theme with HUD chrome (particle field, greeblies) — as if the visitor is viewing the resume on a terminal. "Paper" stays a downloadable-PDF concept only; the on-screen page no longer uses the `paper` color tokens or `font-serif` white-page styling.
- **Print stays plain.** The existing `@media print` rules (force white background / black text, hide nav/footer/`.no-print`) are the source of truth for the printed/PDF-from-browser output and are kept and extended, not replaced. All decorative dark-theme chrome (particle canvas, greeblies, colored panel borders) is scoped `.no-print` and `aria-hidden`.
- **Richer greeble decoration** (user preference): beyond corner handles, add a `LockBox`-style stamp, an `ArrayChip`, and a footer status strip echoing (not literally reusing) the boot console's HUD footer band, plus an optional `SyncWidget`/`NineDWidget` in a side margin on wide viewports.

## Approach

### 1. `src/lib/site.ts`

```ts
links: {
  linkedin: '...',
  github: '...',
  resumePdf: '/Ron_Meck_Enterprise_Architect_Resume.pdf',
  resumePdfAts: '/Ron_Meck_Enterprise_AI_Architect_ATS.pdf',
}
```

Delete `public/Ron_Meck_Resume.pdf`.

### 2. `TheRecord.astro`

Replace the single `btn-solid` link with two buttons in the existing flex row:

- `DOWNLOAD PDF RESUME ↓` — `.btn-solid`, `site.links.resumePdf`.
- `ATS-FRIENDLY VERSION ↓` — `.btn-outline`, `site.links.resumePdfAts`.

No layout restructuring beyond accommodating a second button; the section's flex-wrap already handles narrow viewports.

### 3. `resume.astro` — terminal-readout theme

**Page shell:**
- Swap `bg-white text-black font-serif` for `bg-surface text-ink` (matching `BaseLayout`'s default — largely just stop overriding it).
- Add `<ParticleField client:idle />` absolutely positioned behind the content, at reduced visual weight relative to the hero instance (lower `LINE_ALPHA`/`DOT_ALPHA`, or a darker scrim over it) so body text stays readable. Wrapped so it doesn't print (`.no-print` on its container).
- Main content sits in a bordered panel (`border border-line`, `bg-surface-raised/80` or similar translucent dark fill) over the particle canvas, with `CornerHandles` at its four corners.

**Header:**
- Name in the site's `h-display` treatment, sized for a document heading (smaller than the hero H1).
- Tagline in serif italic, as elsewhere on the site.
- Contact row (location, phone, decoded email, LinkedIn) restyled as a mono eyebrow line (`text-ink/50`, accent bullet/dot separators) instead of the current plain gray inline list. The existing character-code email decode script is unchanged.

**Section headers:**
- Work Experience / Previous Experience / Skills / Education each get the homepage's `SectionHeader.astro` treatment (dark variant: `NN / NAME` mono eyebrow in accent + hairline rule), replacing the current `border-b-2 border-black uppercase` headings.

**Body content:**
- Featured/previous experience entries keep their current data shape and layout logic (grid rows, date formatting) but move to dark-theme colors (`text-ink`, `text-ink-muted` in place of the various `text-black`/`text-gray-*` utilities).
- Skills render as `.tag-chip` pills (one per skill) instead of a comma-joined string.
- Education keeps its current simple layout, recolored.

**Download CTAs:**
- Same two-button treatment as "The Record" (`btn-solid` + `btn-outline`, `resumePdf` + `resumePdfAts`), inside the existing `.no-print` box.

**Greeblies** (all `aria-hidden="true"`, all inside `.no-print` so they never appear in printed output):
- `CornerHandles` on the main content panel.
- A `LockBox`-style badge near the header (e.g. `// ARCHIVE` with a short code) as a "verified record" stamp.
- An `ArrayChip` near the Skills section.
- A footer status strip inside the panel: `StatusDots` + a mono `TTY/n :: RESUME EXPORT`-style line — new copy, not a literal reuse of the boot console's "OPERATOR CONSOLE" strings, since this is a different context.
- Optionally a `SyncWidget` or `NineDWidget` in a side margin, `hidden lg:block` — pure decoration, no data behind it.

**Print behavior:**
- Existing `@media print` block (forces `background: white`, `color: black`, hides `.no-print`/nav/footer) stays as the baseline safety net.
- Audit the new panel's border/background utilities and add print overrides in the component's scoped `<style>` block if any dark fill or colored border would otherwise survive printing (the current global rule only forces `background`/`color`, not arbitrary Tailwind border colors on inner elements).

## Error handling / edge cases

- No JS is added for the download buttons or panel — plain links and CSS, so this works with JS disabled exactly as it does today.
- `ParticleField` already self-guards on `prefers-reduced-motion` and pauses on tab-hidden; reusing it on `/resume` inherits that behavior for free.
- Greeble components are presentational-only (no data fetching, no interactivity) and already accept a `reduced` prop where animated — pass through `prefers-reduced-motion` the same way the boot console does, or simply hardcode static (non-animated) presentation for the ones used here if simplest.

## Verification

- `astro build` and `astro check` pass.
- Browser pass: `/resume` at desktop and ~375px widths — panel legible over the particle field, greeblies don't overlap body text, both download buttons resolve to the correct PDFs.
- Print preview (`Cmd+P` / print-to-PDF) of `/resume`: plain white/black, no particle field, no greeblies, no nav/footer, matches current print output structure.
- Homepage "The Record" section: both buttons visible and pointing at the correct files, at desktop and mobile widths.
- Confirm `public/Ron_Meck_Resume.pdf` is removed and nothing else in the repo references it.
