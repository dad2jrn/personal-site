# Cinematic Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild ronmeck.dev as the handoff's cinematic single-page design (boot → hero/particles → chaptered sections → contact) and reskin all inner pages to the same dark/amber design system.

**Architecture:** In-place rebuild on the `revision` branch, on an upgraded platform (Task 0 lands Astro 7 / Tailwind 4 / React 19.2.7 before any redesign work). Design tokens are defined at the root (Tailwind 4 `@theme` block in `global.css` — there is no `tailwind.config.mjs` anymore) so semantic classes (`text-ink`, `bg-surface`, `border-line`) flow the new palette everywhere automatically. The homepage becomes ~10 Astro section components in `src/components/home/` with 4 React islands in `src/components/home/islands/`. Content stays driven by the existing content collections via the Content Layer API.

**Tech Stack:** Astro 7 (latest stable), React 19.2.7, Tailwind CSS 4.3.2 (CSS-first config via `@tailwindcss/vite`), TypeScript, MDX. Fonts self-hosted via @fontsource.

**Spec:** `docs/superpowers/specs/2026-07-03-cinematic-redesign-design.md`. **Pixel reference:** `design_handoff_ronmeck_site/Ron Meck.dc.html` (its `Component` class is the behavioral spec — all constants below were ported from it).

## Global Constraints

- Amber `#F5A524` (rgb `245 165 36`) is the ONLY accent on dark. Paper section uses `#8A6A1F` / `#B07C1E`.
- Page background `#0A0A0B`; ink `#EDEBE6`; boot overlay `#060607`; paper `#E9E5DC` with ink `#141412`.
- Sharp corners everywhere. `rounded-*` is allowed ONLY for: pulsing dots, cursor dot/ring, and the boot cursor block (none — it's square). No other rounding.
- All labels/eyebrows/nav/footer/tags: JetBrains Mono, uppercase, letter-spacing 0.08–0.14em.
- Headlines: Archivo weight 800–900, font-stretch 112–125% (arbitrary property `[font-stretch:N%]`), uppercase, tight tracking.
- The email address must NEVER appear in delivered/built HTML. Only assembled from char codes at runtime.
- Every animation respects `prefers-reduced-motion: reduce`.
- Dark-only: no theme toggle, no `dark:` variants in final code.
- Platform pins: `astro` ^7 (latest stable), `tailwindcss` 4.3.2 exactly, `react`/`react-dom` 19.2.7 exactly, Node ≥ 22 (Astro 6+ floor).
- Tailwind 4 idiom throughout new code: theme in `@theme`, `@import "tailwindcss"` (no `@tailwind` directives), `outline-hidden` not `outline-none`, `bg-linear-to-*` not `bg-gradient-to-*`. No `tailwind.config.mjs`.
- Content Layer API throughout: collections defined in `src/content.config.ts` with `glob()` loaders; `entry.id` (never `entry.slug`); `render(entry)` from `astro:content` (never `entry.render()`).
- No new runtime dependencies beyond the two font packages and the platform set (`tailwindcss`, `@tailwindcss/vite`, `@tailwindcss/typography`).
- Copy is final: take strings verbatim from the prototype HTML (they are reproduced in this plan).
- No test framework exists; verification is `npm run build` + targeted `grep` + browser passes. Run builds from the repo root `/Users/interlinked/Projects/personal site`.
- Commit after every task. End commit messages with `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- FloatingArtifacts are CUT (user decision) — do not build them even though the prototype has them.
- Deferred TODO (do NOT implement): mouse-responsive particle field. Leave the marker comment in `ParticleField.tsx`.

---

### Task 0: Platform upgrade — Astro 7, Tailwind 4.3.2, React 19.2.7, Content Layer API

Goal: the site builds and looks EXACTLY as it does today, on the new platform. No redesign work in this task — it isolates upgrade breakage from redesign breakage.

**Files:**
- Modify: `package.json` (via npm commands)
- Modify: `astro.config.mjs` (full rewrite)
- Delete: `tailwind.config.mjs` (absorbed into CSS)
- Move + rewrite: `src/content/config.ts` → `src/content.config.ts`
- Modify: `src/styles/global.css` (Tailwind 4 conversion, old tokens kept)
- Modify: every consumer of `entry.slug` / `entry.render()` (found by grep in Step 5)

**Interfaces:**
- Produces: Content Layer collections — later tasks use `entry.id` for URLs (`/work/${study.id}/`) and `render(entry)` for MDX bodies. For `glob()` loaders, `entry.id` is the extension-less filename, identical to the old `entry.slug`, so existing URLs do not change.
- Produces: Tailwind 4 pipeline — later tasks write `@theme`/`@utility`-era CSS and Tailwind 4 class names.

- [ ] **Step 1: Check Node version**

```bash
node -v
```

Expected: v22 or higher. If lower, stop and install Node 22 LTS before continuing (Astro 6+ dropped Node 18/20).

- [ ] **Step 2: Upgrade packages**

```bash
npm install astro@latest @astrojs/mdx@latest @astrojs/react@latest @astrojs/sitemap@latest react@19.2.7 react-dom@19.2.7
npm uninstall @astrojs/tailwind
npm install tailwindcss@4.3.2 @tailwindcss/vite@latest @tailwindcss/typography@latest
npm ls astro tailwindcss react
```

Expected: `astro@7.x`, `tailwindcss@4.3.2`, `react@19.2.7`. If `@astrojs/mdx`/`react`/`sitemap` latest majors declare a peer conflict with astro 7, install the exact majors the error message names.

- [ ] **Step 3: Rewrite `astro.config.mjs`** with exactly:

```js
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://ronmeck.dev',
  base: '/',
  integrations: [
    mdx(),
    sitemap(),
    react(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  build: { format: 'directory' },
});
```

(Leave `tailwind.config.mjs` in place for now — the Step 4 codemod reads it.)

- [ ] **Step 4: Convert `src/styles/global.css` to Tailwind 4 (keeping the OLD look)**

First try the official codemod, which converts directives, migrates the JS config's theme into CSS, and renames changed utility classes across `src/`:

```bash
npx @tailwindcss/upgrade
```

Review the diff it produces, then delete the JS config Tailwind 4 no longer reads (if the codemod didn't already):

```bash
git rm --ignore-unmatch tailwind.config.mjs
```

If the tool fails or the result doesn't build, do the conversion manually:

1. In `global.css`, replace the three `@tailwind base; @tailwind components; @tailwind utilities;` lines with:

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";

/* Class-based dark variant: no element ever gets .dark after the redesign,
   which neutralizes legacy dark: classes until Task 9 deletes them. */
@custom-variant dark (&:where(.dark, .dark *));

@theme inline {
  --color-ink: rgb(var(--ink));
  --color-ink-muted: rgb(var(--ink-muted));
  --color-ink-subtle: rgb(var(--ink-subtle));
  --color-surface: rgb(var(--surface));
  --color-surface-raised: rgb(var(--surface-raised));
  --color-surface-sunken: rgb(var(--surface-sunken));
  --color-line: rgb(var(--line));
  --color-line-strong: rgb(var(--line-strong));
  --color-accent: rgb(var(--accent));
  --color-accent-soft: rgb(var(--accent-soft));
  --font-sans: 'Geist', sans-serif;
  --font-display: 'Fraunces Variable', serif;
  --font-mono: 'JetBrains Mono Variable', monospace;
  --container-site: 1180px;
  --tracking-mono-wide: 0.05em;
}
```

(`@theme inline` keeps the utilities pointing at the runtime `--ink`/`--surface` vars so the existing `.dark` toggle keeps working until Task 1 removes it.)

2. Apply Tailwind 4 renames in `global.css` and `src/`:
   - `@apply outline-none` → `@apply outline-hidden` (in `:focus-visible`)
   - `bg-gradient-to-b`/`bg-gradient-to-br` → `bg-linear-to-b`/`bg-linear-to-br` (`grep -rn "bg-gradient" src/`)
   - `theme('fontFamily.sans')` in the `html` rule → `var(--font-sans)`

- [ ] **Step 5: Migrate content collections to the Content Layer API**

```bash
git mv src/content/config.ts src/content.config.ts
```

Rewrite `src/content.config.ts` with exactly:

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const experience = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/experience' }),
  schema: z.object({
    company: z.string(),
    role: z.string(),
    startDate: z.string(),       // "2024-01"
    endDate: z.string().nullable(), // null = present
    location: z.string(),
    sector: z.enum(['banking', 'fortune-100', 'gov-public', 'consulting', 'military']),
    featured: z.boolean().default(false),
    order: z.number(),           // for ties; lower = appears first
    summary: z.string(),         // 1-2 sentence summary
    achievements: z.array(z.string()).optional(), // bullet points for resume
  }),
});

const patents = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/patents' }),
  schema: z.object({
    title: z.string(),
    patentNumber: z.string(),    // USPTO number e.g. "US 11,238,541 B2"
    filedDate: z.string().optional(),
    grantedDate: z.string().optional(),
    inventors: z.array(z.string()),
    assignee: z.string(),
    abstract: z.string(),        // PARAPHRASED in Ron's words, not USPTO copy
    tags: z.array(z.string()).default([]),
    usptoUrl: z.url().optional(), // Zod 4: z.string().url() is gone
  }),
});

const caseStudies = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/case-studies' }),
  schema: z.object({
    title: z.string(),
    company: z.string(),
    role: z.string(),
    period: z.string(),          // "2016 – 2023"
    dek: z.string(),             // 1-line subtitle, used on detail page
    summary: z.string(),         // 2-3 sentence summary for the index card
    scale: z.array(z.object({    // metrics surfaced in sidebar
      label: z.string(),
      value: z.string(),
    })),
    tools: z.array(z.string()),  // e.g. ["AWS", "Kubernetes", "Kafka"]
    outcomes: z.array(z.string()),
    publishedAt: z.string(),
    featured: z.boolean().default(false),
  }),
});

const writing = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/writing' }),
  schema: z.object({
    title: z.string(),
    dek: z.string(),
    publishedAt: z.string(),
    updatedAt: z.string().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { experience, patents, 'case-studies': caseStudies, writing };
```

Then update every consumer:

```bash
grep -rn "\.slug\b" src/
grep -rn "\.render()" src/
```

For each `.slug` hit on a collection entry (expected: `src/pages/index.astro`, `src/pages/work/index.astro`, `src/pages/writing/index.astro`, possibly `src/components/PatentCard.astro`): change `entry.slug` → `entry.id`.

For each dynamic route (`src/pages/work/[slug].astro`, `src/pages/patents/[slug].astro`, `src/pages/writing/[slug].astro`), apply the canonical migration — `getStaticPaths` maps params from `entry.id`, and rendering uses the standalone `render()`:

```astro
---
import { getCollection, render } from 'astro:content';

export async function getStaticPaths() {
  const entries = await getCollection('case-studies'); // per file: its own collection
  return entries.map((entry) => ({ params: { slug: entry.id }, props: { entry } }));
}

const { entry } = Astro.props;
const { Content } = await render(entry);
---
```

Keep each file's existing markup and any extra frontmatter logic; only the API calls change.

- [ ] **Step 6: Build and fix what the stricter platform flags**

```bash
npm run build
```

Fix any errors, which will fall into three known buckets:
1. **Rust compiler strictness** (Astro 7): unclosed tags / unterminated attributes in `.astro` files — close them; no behavior change intended.
2. **Markdown pipeline** (Sätteri): if MDX content fails to process, run `npm install @astrojs/markdown-remark` and follow the error's configuration hint.
3. **Tailwind 4 class renames** the codemod missed — fix per the rename list in Step 4.

Then view `/`, `/work/`, `/patents/`, `/writing/`, `/resume/`, `/contact/` in the dev server: the site must look IDENTICAL to pre-upgrade (same fonts, colors, light/dark toggle still working). Fix regressions before committing.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore(revision): upgrade to Astro 7, Tailwind 4.3.2, React 19.2.7; migrate to Content Layer API"
```

---

### Task 1: Foundation — fonts, tokens, global.css, BaseLayout

**Files:**
- Modify: `package.json` (via npm commands)
- Modify: `src/styles/global.css` (full rewrite)
- Modify: `src/layouts/BaseLayout.astro` (full rewrite)
- Delete: `src/components/ThemeScript.astro`

**Interfaces:**
- Produces CSS component classes used by every later task: `.container-site`, `.label-mono`, `.hairline`, `.eyebrow`, `.h-display`, `.tag-chip`, `.btn-outline`, `.btn-solid`, `.boot-line`
- Produces keyframes referenced via Tailwind arbitrary values: `rm-marquee`, `rm-blink`, `rm-bootline`, `rm-pulse`, `rm-scan`, `rm-fadeup`
- Produces Tailwind colors: `ink`, `ink-muted`, `ink-subtle`, `surface`, `surface-raised`, `surface-sunken`, `line`, `line-strong`, `accent`, `paper`, `paper-ink`, `paper-accent`, `paper-accent-bright`, `paper-line`
- Produces fonts: `font-sans` = Archivo Variable, `font-serif` = Instrument Serif, `font-mono` = JetBrains Mono Variable

- [ ] **Step 1: Swap font packages**

```bash
npm uninstall @fontsource-variable/fraunces @fontsource/geist-sans
npm install @fontsource-variable/archivo @fontsource/instrument-serif
```

Then verify the width-axis file exists:

```bash
ls node_modules/@fontsource-variable/archivo/
```

Expected: a `wdth.css` file is listed. If it is NOT there, use `standard.css` (and if that's absent, `index.css`) in the import below — but `wdth.css` is required for `font-stretch` to work, so prefer it; `full.css` also works.

- [ ] **Step 2: Rewrite `src/styles/global.css`** with exactly:

```css
/* Fonts — self-hosted, zero external requests */
@import '@fontsource-variable/archivo/wdth.css';
@import '@fontsource-variable/jetbrains-mono/index.css';
@import '@fontsource/instrument-serif/400.css';
@import '@fontsource/instrument-serif/400-italic.css';

@import "tailwindcss";
@plugin "@tailwindcss/typography";

/* Class-based dark variant so legacy dark: classes stay dead (no .dark class
   is ever set). The whole line is deleted in Task 10 after Task 9's sweep. */
@custom-variant dark (&:where(.dark, .dark *));

@theme {
  --color-ink: #EDEBE6;
  --color-ink-muted: rgb(237 235 230 / 0.55);
  --color-ink-subtle: rgb(237 235 230 / 0.45);
  --color-surface: #0A0A0B;
  --color-surface-raised: #16161A;
  --color-surface-sunken: #060607;
  --color-line: rgb(237 235 230 / 0.12);
  --color-line-strong: rgb(237 235 230 / 0.2);
  --color-accent: #F5A524;
  --color-accent-soft: rgb(245 165 36 / 0.35);
  --color-paper: #E9E5DC;
  --color-paper-ink: #141412;
  --color-paper-accent: #8A6A1F;
  --color-paper-accent-bright: #B07C1E;
  --color-paper-line: rgb(20 20 18 / 0.2);

  --font-sans: 'Archivo Variable', sans-serif;
  --font-serif: 'Instrument Serif', serif;
  --font-mono: 'JetBrains Mono Variable', monospace;

  --container-site: 1200px;
  --tracking-mono-wide: 0.05em;
}

@layer base {
  html {
    @apply bg-surface font-sans text-ink antialiased;
    scroll-behavior: smooth;
    text-rendering: optimizeLegibility;
  }

  body { @apply bg-surface text-ink; min-height: 100vh; }

  ::selection { background-color: var(--color-accent); color: var(--color-surface); }

  :focus-visible {
    @apply outline-hidden ring-2 ring-accent ring-offset-2 ring-offset-surface;
  }
}

/* Motion vocabulary (plain CSS so Tailwind never purges it) */
@keyframes rm-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@keyframes rm-blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
@keyframes rm-bootline { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes rm-pulse { 0%, 100% { transform: scale(1); opacity: 0.5; } 50% { transform: scale(1.5); opacity: 1; } }
@keyframes rm-scan { from { top: -20%; } to { top: 120%; } }
@keyframes rm-fadeup { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: translateY(0); } }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  html { scroll-behavior: auto; }
}

@layer components {
  .container-site { @apply mx-auto w-full max-w-site px-6 md:px-10; }
  .label-mono { @apply font-mono text-[11px] uppercase tracking-[0.1em] text-ink-subtle; }
  .hairline { @apply border-t border-line; }
  .eyebrow { @apply font-mono text-[13px] uppercase tracking-[0.14em] text-accent; }
  .h-display {
    font-weight: 800;
    font-stretch: 118%;
    text-transform: uppercase;
    letter-spacing: -0.02em;
    line-height: 0.98;
  }
  .tag-chip { @apply inline-block border border-ink/20 px-[10px] py-[5px] font-mono text-[11px] tracking-[0.08em] uppercase; }
  .btn-outline { @apply inline-block border border-ink/30 px-6 py-[14px] font-mono text-[12px] tracking-[0.12em] text-ink no-underline transition-colors hover:border-accent hover:text-accent; }
  .btn-solid { @apply inline-block bg-accent px-8 py-[18px] font-mono text-[13px] font-bold tracking-[0.12em] text-surface no-underline transition-transform hover:-translate-y-[3px]; }
  .boot-line { animation: rm-bootline 0.3s both; }

  /* Prose (MDX bodies) */
  .prose { @apply max-w-none leading-relaxed text-ink-muted; }
  .prose p { @apply mb-6; }
  .prose h1, .prose h2, .prose h3, .prose h4 {
    @apply mb-6 mt-12 font-bold uppercase tracking-[-0.01em] text-ink [font-stretch:112%];
  }
  .prose h1 { @apply text-3xl md:text-4xl; }
  .prose h2 { @apply text-2xl md:text-3xl; }
  .prose h3 { @apply text-xl md:text-2xl; }
  .prose strong { @apply font-semibold text-ink; }
  .prose a { @apply text-accent no-underline transition-colors hover:text-ink; }
  .prose code { @apply bg-surface-raised px-1.5 py-0.5 font-mono text-[0.9em] text-accent; }
  .prose code::before, .prose code::after { content: ""; }
  .prose blockquote { @apply border-l-2 border-accent pl-6 italic text-ink-muted; }
  .prose ul, .prose ol { @apply mb-8 list-outside space-y-3; }
  .prose li { @apply pl-2; }
  .prose li::marker { @apply font-bold text-accent; }
}

@media print {
  @page { size: Letter; margin: 0.6in 0.75in; }
  html, body { background: white !important; color: black !important; font-size: 10.5pt; }
  .no-print { display: none !important; }
  a { color: black !important; text-decoration: none !important; }
}
```

Note: the old `flow`/`flow-reverse`/`scan` keyframes used by `CaseStudyVisual.astro` were defined in the old stylesheet's components layer. `CaseStudyVisual` survives (used on `/work/`), so ALSO keep these at the end of the file (copy verbatim from the pre-rewrite `global.css` — the `@keyframes flow`, `@keyframes flow-reverse`, `@keyframes scan` blocks and the `.animate-flow`, `.animate-flow-reverse`, `.animate-scan` classes).

- [ ] **Step 3: Confirm no Tailwind JS config remains**

Tailwind 4's theme now lives entirely in the `@theme` block above (Task 0 deleted `tailwind.config.mjs`). Verify:

```bash
ls tailwind.config.* 2>/dev/null; grep -rn "@config" src/styles/
```

Expected: no config file, no `@config` directive. If the Task 0 codemod left an `@config "./tailwind.config.mjs"` line or a config file behind, delete both — the `@theme` block is the single source of truth.

- [ ] **Step 4: Rewrite `src/layouts/BaseLayout.astro`** with exactly:

```astro
---
import Nav from '../components/Nav.astro';
import Footer from '../components/Footer.astro';
import '../styles/global.css';

interface Props {
  title?: string;
  description?: string;
}

const {
  title = "Ron Meck — Enterprise Architect",
  description = "Enterprise architect and technology transformation leader. I design platforms that move trillions and serve tens of millions."
} = Astro.props;
---

<!doctype html>
<html lang="en" style="color-scheme: dark;">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="generator" content={Astro.generator} />
    <title>{title}</title>
    <meta name="description" content={description} />
  </head>
  <body class="flex min-h-screen flex-col">
    <Nav />
    <main class="flex-grow">
      <slot />
    </main>
    <Footer />
  </body>
</html>
```

(Removes: `ThemeScript`, `ClientRouter`/`astro:transitions`, `class="dark"`, `currentPath` plumbing. The old `Nav` accepted `currentPath` as an optional prop, so passing nothing is safe until Task 2 rebuilds it.)

- [ ] **Step 5: Delete the theme script**

```bash
git rm src/components/ThemeScript.astro
```

- [ ] **Step 6: Verify build**

```bash
npm run build
```

Expected: build succeeds. (Pages will look half-restyled — old layouts, new dark palette. That's expected until Tasks 3–9.)

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(revision): new design tokens — Archivo/Instrument Serif fonts, amber-on-black palette, dark-only"
```

---

### Task 2: Shell — Nav, Footer, sound engine, reveal script

**Files:**
- Create: `src/scripts/sound.ts`
- Create: `src/scripts/reveal.ts`
- Modify: `src/components/Nav.astro` (full rewrite)
- Modify: `src/components/Footer.astro` (full rewrite)
- Modify: `src/layouts/BaseLayout.astro` (add reveal script)

**Interfaces:**
- Produces `src/scripts/sound.ts`: `soundOn(): boolean`, `setSound(on: boolean): void`, `blip(freq: number, gain: number): void`. State lives on `window.__rmSound` so Astro scripts and React islands share it. Callers check `soundOn()` before calling `blip()`.
- Produces the `data-reveal` convention: any element with a `data-reveal` attribute below the fold fades/rises in on first intersection. Later tasks just add the attribute.

- [ ] **Step 1: Create `src/scripts/sound.ts`** with exactly:

```ts
// WebAudio sine blips. Off by default; footer toggle flips it.
// State lives on window so every bundle (Astro scripts, React islands) shares it.
type RMSound = { on: boolean; ctx?: AudioContext };

declare global {
  interface Window { __rmSound?: RMSound }
}

function store(): RMSound {
  if (!window.__rmSound) window.__rmSound = { on: false };
  return window.__rmSound;
}

export function soundOn(): boolean {
  return store().on;
}

export function setSound(on: boolean): void {
  store().on = on;
  if (on) blip(880, 0.05); // confirm blip on enable
}

export function blip(freq: number, gain: number): void {
  try {
    const s = store();
    if (!s.ctx) s.ctx = new AudioContext(); // lazily created on first user gesture
    const ctx = s.ctx;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    g.gain.setValueAtTime(gain, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.09);
  } catch {
    /* audio unavailable */
  }
}
```

- [ ] **Step 2: Create `src/scripts/reveal.ts`** with exactly:

```ts
// Scroll reveals for [data-reveal]. Elements already in the first viewport
// are never hidden (no-JS safe: hidden state is only ever applied by JS).
export function initReveals(): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        const el = e.target as HTMLElement;
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
        io.unobserve(el);
      }
    }
  }, { threshold: 0.12 });
  els.forEach((el, i) => {
    if (el.getBoundingClientRect().top > window.innerHeight * 0.92) {
      const d = (i % 4) * 0.08;
      el.style.opacity = '0';
      el.style.transform = 'translateY(28px)';
      el.style.transition = `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${d}s, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${d}s`;
      io.observe(el);
    }
  });
}
```

- [ ] **Step 3: Rewrite `src/components/Nav.astro`** with exactly:

```astro
---
const navItems = [
  { label: 'WORK', href: '/#work' },
  { label: 'PATENTS', href: '/#patents' },
  { label: 'WRITING', href: '/#writing' },
  { label: 'RESUME', href: '/#resume' },
  { label: 'CONTACT', href: '/#contact' },
];
---

<div id="scroll-progress" class="fixed left-0 top-0 z-[90] h-[2px] w-0 bg-accent"></div>
<nav class="fixed left-0 right-0 top-0 z-[80] flex items-center justify-between px-6 py-5 [mix-blend-mode:difference] md:px-10">
  <a href="/" class="text-[20px] font-extrabold tracking-[-0.02em] text-ink no-underline [font-stretch:125%]">RM<span class="text-accent">.</span></a>
  <div class="hidden gap-7 font-mono text-[12px] tracking-[0.08em] min-[700px]:flex">
    {navItems.map((item) => (
      <a href={item.href} class="text-ink no-underline transition-colors hover:text-accent">{item.label}</a>
    ))}
  </div>
</nav>

<script>
  const bar = document.getElementById('scroll-progress');
  const onScroll = () => {
    const h = document.documentElement;
    const pct = (h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight)) * 100;
    if (bar) bar.style.width = pct + '%';
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
</script>
```

- [ ] **Step 4: Rewrite `src/components/Footer.astro`** with exactly:

```astro
---
const gitSha = import.meta.env.PUBLIC_GIT_SHA || 'dev';
const shortSha = gitSha.substring(0, 7);
const now = new Date();
const version = `v${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}`;
---

<footer class="hairline mt-auto flex flex-wrap items-center justify-between gap-6 px-6 py-[18px] font-mono text-[11px] uppercase tracking-[0.1em] text-ink-subtle md:px-10">
  <span>BUILD · main@{shortSha} / {version}</span>
  <span>SESSION UPTIME · <span id="footer-uptime" class="text-accent">00:00</span> · SYS NOMINAL</span>
  <button id="sound-toggle" type="button" class="border border-ink/20 px-3 py-[6px] font-mono text-[11px] uppercase tracking-[0.1em] text-ink-subtle transition-colors hover:border-accent hover:text-accent">SOUND · OFF</button>
  <span>© {now.getFullYear()} RON MECK</span>
</footer>

<script>
  import { soundOn, setSound } from '../scripts/sound';

  const start = Date.now();
  const uptimeEl = document.getElementById('footer-uptime');
  setInterval(() => {
    const s = Math.floor((Date.now() - start) / 1000);
    const mm = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    if (uptimeEl) uptimeEl.textContent = `${mm}:${ss}`;
  }, 1000);

  const btn = document.getElementById('sound-toggle');
  if (btn) {
    btn.addEventListener('click', () => {
      setSound(!soundOn());
      btn.textContent = `SOUND · ${soundOn() ? 'ON' : 'OFF'}`;
    });
  }
</script>
```

- [ ] **Step 5: Wire reveals into `src/layouts/BaseLayout.astro`** — add before `</body>`:

```astro
    <script>
      import { initReveals } from '../scripts/reveal';
      initReveals();
    </script>
```

- [ ] **Step 6: Verify**

```bash
npm run build
```

Expected: success. Then `npm run dev`, open http://localhost:4321/ and confirm: fixed nav with RM. wordmark and amber-dot progress bar filling on scroll; footer shows ticking uptime and SOUND · OFF toggles to ON on click.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(revision): fixed difference-blend nav with scroll progress, system footer, sound engine, reveal script"
```

---

### Task 3: Homepage hero — BootOverlay, ParticleField, HomeHero; reset index.astro

**Files:**
- Create: `src/components/home/BootOverlay.astro`
- Create: `src/components/home/islands/ParticleField.tsx`
- Create: `src/components/home/HomeHero.astro`
- Modify: `src/pages/index.astro` (full rewrite — hero only; sections re-added in Tasks 4–7)
- Delete: `src/components/Hero.astro`, `src/components/MetricStrip.astro`, `src/components/StatusPill.astro`

**Interfaces:**
- Consumes: keyframes + component classes from Task 1.
- Produces: `<BootOverlay />`, `<HomeHero />` (no props).

- [ ] **Step 1: Create `src/components/home/BootOverlay.astro`** with exactly:

```astro
{/* Terminal boot intro. Hidden by default (no-JS never blocks); inline script
    shows it only when it should play, once per session, never under reduced motion. */}
<div id="boot-overlay" class="fixed inset-0 z-[150] hidden items-center justify-center bg-surface-sunken transition-opacity duration-500">
  <div class="min-w-[340px] font-mono text-[14px] leading-[2.1] text-accent">
    <div class="boot-line" style="animation-delay: 0.1s">&gt; RM_OS v26.07 — initializing</div>
    <div class="boot-line text-ink/75" style="animation-delay: 0.55s">&gt; mounting /career ······· 25 YRS · OK</div>
    <div class="boot-line text-ink/75" style="animation-delay: 1s">&gt; loading platforms ····· $2.0T · OK</div>
    <div class="boot-line text-ink/75" style="animation-delay: 1.45s">&gt; verifying patents ······ [4/4] · OK</div>
    <div class="boot-line" style="animation-delay: 1.9s">&gt; render: ronmeck.dev<span class="ml-[6px] inline-block h-[15px] w-[9px] translate-y-[2px] animate-[rm-blink_0.9s_infinite] bg-accent"></span></div>
  </div>
</div>

<script is:inline>
  (() => {
    const el = document.getElementById('boot-overlay');
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let played = false;
    try { played = !!sessionStorage.getItem('rm-boot-played'); } catch {}
    if (reduced || played) { el.remove(); return; }
    try { sessionStorage.setItem('rm-boot-played', '1'); } catch {}
    el.style.display = 'flex';
    setTimeout(() => { el.style.opacity = '0'; }, 2600);
    setTimeout(() => { el.remove(); }, 3150);
  })();
</script>
```

- [ ] **Step 2: Create `src/components/home/islands/ParticleField.tsx`** with exactly:

```tsx
import { useEffect, useRef } from 'react';

const ACCENT = '245,165,36';
const N = 80;
const LINK_DIST = 130;
// Visibility bumped over the prototype (0.22 / 2px / 0.7) per spec — clearer, not overbearing.
const LINE_ALPHA = 0.32;
const DOT_SIZE = 2.5;
const DOT_ALPHA = 0.85;

// TODO(deferred): make the field mouse-responsive — to be brainstormed in a future session.
export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let raf = 0;
    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * devicePixelRatio;
      canvas.height = h * devicePixelRatio;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const pts = Array.from({ length: N }, () => ({
      x: Math.random() * 2000,
      y: Math.random() * 1200,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
    }));

    const draw = () => {
      raf = requestAnimationFrame(draw);
      if (document.hidden) return; // pause when tab hidden
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        p.x = Math.max(0, Math.min(w, p.x));
        p.y = Math.max(0, Math.min(h, p.y));
      }
      ctx.lineWidth = 1;
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK_DIST * LINK_DIST) {
            const a = (1 - Math.sqrt(d2) / LINK_DIST) * LINE_ALPHA;
            ctx.strokeStyle = `rgba(${ACCENT},${a})`;
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }
      }
      ctx.fillStyle = `rgba(${ACCENT},${DOT_ALPHA})`;
      for (const p of pts) {
        ctx.fillRect(p.x - DOT_SIZE / 2, p.y - DOT_SIZE / 2, DOT_SIZE, DOT_SIZE);
      }
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />;
}
```

- [ ] **Step 3: Create `src/components/home/HomeHero.astro`** with exactly:

```astro
---
import ParticleField from './islands/ParticleField';

const ticker = [
  '$2T+ ANNUAL VOLUME',
  '60M MONTHLY USERS',
  '4 US PATENTS',
  '75% FASTER DELIVERY',
  '$30M REVENUE UNLOCKED',
];
---

<header id="top" class="relative flex min-h-screen flex-col justify-end overflow-hidden">
  <div class="absolute inset-0">
    <ParticleField client:idle />
  </div>
  <div class="pointer-events-none absolute inset-0 [background:radial-gradient(ellipse_at_50%_100%,rgba(10,10,11,0)_30%,rgba(10,10,11,0.85)_100%)]"></div>
  <div class="relative px-6 md:px-10">
    <div class="mb-6 flex flex-wrap gap-6 font-mono text-[12px] tracking-[0.14em] text-accent">
      <span><span class="mr-2 inline-block h-[7px] w-[7px] animate-[rm-pulse_2s_infinite] rounded-full bg-accent"></span>AVAILABLE</span>
      <span class="text-ink/50">GREATER RICHMOND, VA</span>
      <span class="text-ink/50">37.5407° N / 77.4360° W</span>
    </div>
    <h1 class="m-0 text-[clamp(72px,15.5vw,260px)] font-black uppercase leading-[0.86] tracking-[-0.03em] [font-stretch:125%]">Ron<br />Meck</h1>
    <div class="flex flex-wrap items-end justify-between gap-10 pb-10 pt-8">
      <p class="m-0 max-w-[560px] font-serif text-[clamp(24px,3vw,40px)] italic leading-[1.15] text-ink">I design the systems money moves through.</p>
      <p class="m-0 max-w-[340px] font-mono text-[13px] leading-[1.8] text-ink-muted">Enterprise architect &amp; technology transformation leader. Twenty-five years across Fortune 100 finance and statewide government.</p>
    </div>
  </div>
  <div class="relative overflow-hidden whitespace-nowrap border-t border-line-strong py-[14px]">
    <div class="inline-flex animate-[rm-marquee_28s_linear_infinite] will-change-transform">
      {[0, 1].map(() => (
        <span class="font-mono text-[13px] tracking-[0.12em] text-ink/70">
          {ticker.map((t) => (
            <>{t}&nbsp;&nbsp;<span class="text-accent">◆</span>&nbsp;&nbsp;</>
          ))}
        </span>
      ))}
    </div>
  </div>
</header>
```

(The marquee duplicates its content once — `[0, 1].map` — so the `translateX(-50%)` loop wraps seamlessly.)

- [ ] **Step 4: Rewrite `src/pages/index.astro`** with exactly:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import BootOverlay from '../components/home/BootOverlay.astro';
import HomeHero from '../components/home/HomeHero.astro';
---

<BaseLayout title="Enterprise Architect & Technology Leader">
  <BootOverlay />
  <HomeHero />
</BaseLayout>
```

- [ ] **Step 5: Delete the replaced components**

```bash
git rm src/components/Hero.astro src/components/MetricStrip.astro src/components/StatusPill.astro
```

Then confirm nothing still imports them:

```bash
grep -rn "MetricStrip\|StatusPill\|components/Hero" src/
```

Expected: no output. (If `StatusPill` is imported anywhere besides the deleted `Hero.astro`, restore it and remove only the others.)

- [ ] **Step 6: Verify**

```bash
npm run build
```

Expected: success. In the dev server: boot sequence plays once (5 amber lines, fade at ~2.6s), reload in the same tab does NOT replay it (sessionStorage), new tab does. Hero fills viewport, particle field visibly drifting behind, marquee scrolls, pulsing AVAILABLE dot.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(revision): cinematic hero — boot overlay, particle field island, marquee ticker"
```

---

### Task 4: Origin + Scale sections (with SectionHeader and count-up stats)

**Files:**
- Create: `src/components/home/SectionHeader.astro`
- Create: `src/components/home/Origin.astro`
- Create: `src/components/home/Scale.astro`
- Modify: `src/pages/index.astro` (append sections)

**Interfaces:**
- Produces `SectionHeader.astro` props: `{ index: string; name: string; meta?: string; paper?: boolean }` — used by Tasks 5 and 6 too.
- Produces the `data-count` convention: `<span data-count="60" data-prefix="$" data-suffix="M">` animates on first intersection (handled by Scale's own script).

- [ ] **Step 1: Create `src/components/home/SectionHeader.astro`** with exactly:

```astro
---
interface Props {
  index: string;
  name: string;
  meta?: string;
  paper?: boolean;
}
const { index, name, meta, paper = false } = Astro.props;
---

<div data-reveal class="mb-[72px] flex items-baseline gap-5">
  <span class:list={["font-mono text-[13px] tracking-[0.14em]", paper ? "text-paper-accent" : "text-accent"]}>{index} / {name}</span>
  <div class:list={["h-px flex-1", paper ? "bg-paper-line" : "bg-ink/[0.14]"]}></div>
  {meta && <span class:list={["font-mono text-[13px]", paper ? "text-paper-ink/45" : "text-ink/40"]}>{meta}</span>}
</div>
```

- [ ] **Step 2: Create `src/components/home/Origin.astro`** with exactly:

```astro
---
import SectionHeader from './SectionHeader.astro';
---

<section id="origin" class="relative bg-paper px-6 pb-[140px] pt-[120px] text-paper-ink md:px-10">
  <div class="mx-auto max-w-site">
    <SectionHeader index="01" name="ORIGIN" meta="1997 → 2016" paper />
    <div class="grid grid-cols-1 items-start gap-[60px] md:grid-cols-2">
      <h2 data-reveal class="h-display m-0 text-[clamp(40px,5vw,76px)]">Every architecture has a foundation<span class="text-paper-accent-bright">.</span></h2>
      <div>
        <p data-reveal class="mb-7 text-[19px] leading-[1.65] text-paper-ink/85">1997. A nineteen-year-old petty officer learns the first rule of mission-critical systems: <em class="font-serif text-[22px]">they don't get to fail.</em></p>
        <p data-reveal class="mb-7 text-[19px] leading-[1.65] text-paper-ink/85">Four years in the Navy. Then a decade architecting enterprise systems for the Army, the Navy, and Bank of America. The scale kept growing. The rule never changed.</p>
        <div data-reveal class="flex flex-wrap gap-8 border-t border-paper-line pt-5 font-mono text-[12px] tracking-[0.1em] text-paper-ink/55">
          <span>US NAVY · 1997</span>
          <span>US ARMY · 2002</span>
          <span>BANK OF AMERICA · 2008</span>
        </div>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Create `src/components/home/Scale.astro`** with exactly:

```astro
---
import SectionHeader from './SectionHeader.astro';

const stats = [
  { count: '2', prefix: '$', suffix: 'T+', label: 'ANNUAL VOLUME', accent: true },
  { count: '60', prefix: '', suffix: 'M', label: 'MONTHLY USERS', accent: false },
  { count: '30', prefix: '$', suffix: 'M', label: 'REVENUE UNLOCKED / YR', accent: false },
  { count: '75', prefix: '', suffix: '%', label: 'FASTER DELIVERY', accent: false },
];
---

<section id="scale" class="relative border-b border-line px-6 py-[140px] md:px-10">
  <div class="mx-auto max-w-site">
    <SectionHeader index="02" name="SCALE" meta="CAPITAL ONE · 2016 → 2023" />
    <h2 data-reveal class="h-display mb-6 max-w-[900px] text-[clamp(40px,5vw,76px)]">Then the numbers got serious<span class="text-accent">.</span></h2>
    <p data-reveal class="mb-20 max-w-[620px] text-[19px] leading-[1.65] text-ink/65">Seven years architecting mission-critical payment systems for a Fortune 100 bank — owning platform architecture end to end, from engineering to security to the board-level roadmap.</p>
    <div class="grid grid-cols-2 gap-px border border-line bg-line md:grid-cols-4">
      {stats.map((s) => (
        <div data-reveal class="bg-surface px-7 py-9">
          <div class:list={["text-[clamp(44px,4.5vw,72px)] font-black leading-none [font-stretch:115%]", s.accent && "text-accent"]}>
            <span data-count={s.count} data-prefix={s.prefix} data-suffix={s.suffix}>{s.prefix}{s.count}{s.suffix}</span>
          </div>
          <div class="mt-4 font-mono text-[12px] tracking-[0.12em] text-ink/50">{s.label}</div>
        </div>
      ))}
    </div>
  </div>
</section>

<script>
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const counters = document.querySelectorAll<HTMLElement>('[data-count]');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      const el = e.target as HTMLElement;
      const target = parseFloat(el.dataset.count || '0');
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';
      if (reduced) { el.textContent = prefix + target + suffix; return; }
      const t0 = performance.now();
      const dur = 1600;
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 4); // easeOutQuart
        el.textContent = prefix + Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.5 });
  counters.forEach((el) => io.observe(el));
</script>
```

- [ ] **Step 4: Append to `src/pages/index.astro`** — add the two imports and render them after `<HomeHero />`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import BootOverlay from '../components/home/BootOverlay.astro';
import HomeHero from '../components/home/HomeHero.astro';
import Origin from '../components/home/Origin.astro';
import Scale from '../components/home/Scale.astro';
---

<BaseLayout title="Enterprise Architect & Technology Leader">
  <BootOverlay />
  <HomeHero />
  <Origin />
  <Scale />
</BaseLayout>
```

- [ ] **Step 5: Verify**

```bash
npm run build
```

Expected: success. Dev server: Origin renders as the single light "paper" section with ochre accents; Scale's four stats count up (1.6s) when scrolled into view, $2T+ number in amber; grid shows 1px hairlines between cells; sections reveal with stagger.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(revision): Origin (paper) and Scale (count-up stats) sections"
```

---

### Task 5: The Work + Timeline sections (schema extensions + content reconciliation)

**Files:**
- Modify: `src/content.config.ts` (extend `case-studies` and `experience` schemas)
- Modify: `src/content/case-studies/capital-one-payments-platform.mdx` (frontmatter)
- Modify: `src/content/case-studies/vdot-architecture-governance.mdx` (frontmatter)
- Modify: `src/content/experience/*.md` (frontmatter, per the table below)
- Create: `src/components/home/TheWork.astro`
- Create: `src/components/home/Timeline.astro`
- Modify: `src/pages/index.astro` (append sections)

**Interfaces:**
- Consumes: `SectionHeader.astro` from Task 4.
- Produces schema fields: case-studies `cardHeader?: string`, `cardSummary?: string`, `cardTags?: string[]`, `order: number` (default 99); experience `shortCompany?: string`, `tag?: string`.

- [ ] **Step 1: Extend schemas in `src/content.config.ts`**

In the `caseStudies` schema object, add after `featured`:

```ts
    order: z.number().default(99),        // homepage card order; lower first
    cardHeader: z.string().optional(),    // mono header on the homepage card
    cardSummary: z.string().optional(),   // homepage card description (falls back to dek)
    cardTags: z.array(z.string()).optional(), // homepage card chips (falls back to tools)
```

In the `experience` schema object, add after `summary`:

```ts
    shortCompany: z.string().optional(),  // timeline display name when company is too long
    tag: z.string().optional(),           // timeline category tag override (defaults from sector)
```

- [ ] **Step 2: Set case-study card frontmatter** (prototype copy, verbatim)

In `src/content/case-studies/capital-one-payments-platform.mdx` frontmatter, add:

```yaml
order: 1
cardHeader: "CAPITAL ONE // ARCH_VISUAL_v1.2"
cardSummary: "A phased decomposition of a legacy payment platform that unlocked $30M in annual revenue and cut feature delivery time by 75%."
cardTags: ["AWS", "KAFKA", "MICROSERVICES", "TERRAFORM"]
```

In `src/content/case-studies/vdot-architecture-governance.mdx` frontmatter, add:

```yaml
order: 2
cardHeader: "VIRGINIA DOT // ARCH_VISUAL_v1.2"
cardSummary: "Establishing a modern architecture practice to govern mission-critical transportation platforms statewide."
cardTags: ["AZURE", "GOVERNANCE", "IT STRATEGY"]
```

Also confirm the VDOT file's `title` is exactly `"Enterprise architecture governance for a state agency"` and the Capital One file's `title` is exactly `"Re-architecting payments at $2T scale"`; fix if they differ (prototype copy wins).

- [ ] **Step 3: Reconcile experience frontmatter to the prototype timeline**

The rendered timeline must be exactly these 10 rows, in this order:

| # | years | role | org (displayed) | tag |
|---|-------|------|-----------------|-----|
| 1 | 2024 — NOW | Sr. Enterprise Architect | Virginia Dept. of Transportation | GOV |
| 2 | 2016 — 2023 | Sr. Manager, Software Engineering Architect | Capital One | BANKING |
| 3 | 2019 — 2021 | Manager, Software Engineering | Capital One | BANKING |
| 4 | 2018 — 2019 | Senior Software Engineer | Capital One | BANKING |
| 5 | 2016 — 2018 | Senior Cloud Platform Engineer | Capital One | BANKING |
| 6 | 2010 — 2016 | Enterprise Solutions Architect | Bank of America | BANKING |
| 7 | 2008 — 2010 | Enterprise Architecture Consultant | Bank of America | CONSULTING |
| 8 | 2007 — 2008 | IT Program Manager | US Navy — NOSTRA | GOV |
| 9 | 2002 — 2007 | Senior Enterprise Architect | US Army — Fort Lee | GOV |
| 10 | 1997 — 2001 | Petty Officer 3rd Class | US Navy | MILITARY |

For each file in `src/content/experience/`:
- `order` must produce this sequence (1–10 as numbered above).
- `role` must match the table exactly.
- `startDate`/`endDate` years must produce the `years` column (`endDate: null` renders NOW).
- Where the display org differs from the file's `company` (rows 1, 8, 9), do NOT change `company` (the resume page uses it); instead add `shortCompany`: row 1 `shortCompany: "Virginia Dept. of Transportation"`, row 8 `shortCompany: "US Navy — NOSTRA"`, row 9 `shortCompany: "US Army — Fort Lee"`.
- The tag is derived from `sector` (mapping in Step 5). Where the mapping's result differs from the table (e.g. row 8 if its sector is `military`), add an explicit `tag:` override, e.g. `tag: "GOV"`.

- [ ] **Step 4: Create `src/components/home/TheWork.astro`** with exactly:

```astro
---
import { getCollection, type CollectionEntry } from 'astro:content';
import SectionHeader from './SectionHeader.astro';

const studies = (await getCollection('case-studies', ({ data }: CollectionEntry<'case-studies'>) => data.featured))
  .sort((a: CollectionEntry<'case-studies'>, b: CollectionEntry<'case-studies'>) => a.data.order - b.data.order);
const scanDurations = ['5s', '6.5s'];
---

<section id="work" class="border-b border-line px-6 py-[140px] md:px-10">
  <div class="mx-auto max-w-site">
    <SectionHeader index="03" name="THE WORK" meta="FEATURED CASE STUDIES" />
    <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
      {studies.map((study: CollectionEntry<'case-studies'>, i: number) => (
        <a data-reveal href={`/work/${study.id}/`} class="group relative block overflow-hidden border border-line p-9 text-ink no-underline transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-accent">
          <div class="pointer-events-none absolute left-0 right-0 h-[40%] bg-linear-to-b from-accent/[0.06] to-transparent" style={`animation: rm-scan ${scanDurations[i % 2]} linear infinite;`}></div>
          <div class="mb-12 font-mono text-[11px] tracking-[0.14em] text-ink-subtle">{study.data.cardHeader ?? `${study.data.company.toUpperCase()} // ARCH_VISUAL_v1.2`}</div>
          <h3 class="mb-4 text-[32px] font-extrabold leading-[1.05] tracking-[-0.01em] [font-stretch:115%]">{study.data.title}</h3>
          <p class="mb-8 text-[15px] leading-[1.6] text-ink/60">{study.data.cardSummary ?? study.data.dek}</p>
          <div class="mb-7 flex flex-wrap gap-[10px]">
            {(study.data.cardTags ?? study.data.tools.slice(0, 4)).map((t: string) => (
              <span class="tag-chip">{t}</span>
            ))}
          </div>
          <span class="font-mono text-[12px] tracking-[0.12em] text-accent">VIEW CASE STUDY →</span>
        </a>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 5: Create `src/components/home/Timeline.astro`** with exactly:

```astro
---
import { getCollection, type CollectionEntry } from 'astro:content';
import SectionHeader from './SectionHeader.astro';

const entries = (await getCollection('experience'))
  .sort((a: CollectionEntry<'experience'>, b: CollectionEntry<'experience'>) => a.data.order - b.data.order);

const TAG: Record<string, string> = {
  'gov-public': 'GOV',
  banking: 'BANKING',
  'fortune-100': 'BANKING',
  consulting: 'CONSULTING',
  military: 'MILITARY',
};
const years = (start: string, end: string | null) =>
  `${start.slice(0, 4)} — ${end ? end.slice(0, 4) : 'NOW'}`;
---

<section id="timeline" class="border-b border-line px-6 py-[140px] md:px-10">
  <div class="mx-auto max-w-site">
    <SectionHeader index="04" name="TIMELINE" meta="1997 → NOW" />
    <div>
      {entries.map((job: CollectionEntry<'experience'>) => (
        <div data-reveal class="grid grid-cols-1 items-baseline gap-2 border-b border-line px-3 py-[22px] transition-[background,padding-left] duration-[250ms] hover:bg-accent/5 hover:pl-6 md:grid-cols-[180px_1fr_220px_110px] md:gap-6">
          <span class="font-mono text-[13px] text-ink-subtle">{years(job.data.startDate, job.data.endDate)}</span>
          <span class="text-[clamp(18px,2vw,26px)] font-bold tracking-[-0.01em] [font-stretch:112%]">{job.data.role}</span>
          <span class="text-[14px] text-ink-muted">{job.data.shortCompany ?? job.data.company}</span>
          <span class="justify-self-start border border-accent/35 px-2 py-1 text-center font-mono text-[10px] tracking-[0.1em] text-accent md:justify-self-stretch">{job.data.tag ?? TAG[job.data.sector]}</span>
        </div>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 6: Append to `src/pages/index.astro`** — add imports and render after `<Scale />`:

```astro
import TheWork from '../components/home/TheWork.astro';
import Timeline from '../components/home/Timeline.astro';
```

```astro
  <TheWork />
  <Timeline />
```

- [ ] **Step 7: Verify**

```bash
npm run build
```

Expected: success. Dev server: two case-study cards with scanline sweeps at different speeds, amber border + lift on hover, linking to `/work/<slug>/`; timeline shows exactly the 10 rows from the Step 3 table in order, rows tint amber and slide right 12px on hover. Cross-check every rendered row against the table.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(revision): The Work case-study cards and career Timeline sections"
```

---

### Task 6: Patents section with accordion island

**Files:**
- Create: `src/components/home/islands/PatentAccordion.tsx`
- Create: `src/components/home/PatentsSection.astro`
- Modify: `src/pages/index.astro` (append section)

**Interfaces:**
- Consumes: `SectionHeader.astro` (Task 4); `blip`/`soundOn` from `src/scripts/sound` (Task 2).
- Produces: `PatentAccordion` React component, props `{ items: PatentItem[] }` where `PatentItem = { number: string; title: string; desc: string; tags: string; href: string }`.

- [ ] **Step 1: Create `src/components/home/islands/PatentAccordion.tsx`** with exactly:

```tsx
import { Fragment, useState } from 'react';
import { blip, soundOn } from '../../../scripts/sound';

export interface PatentItem {
  number: string;
  title: string;
  desc: string;
  tags: string;
  href: string;
}

// Decorative schematic nodes: filled circle / rotated square / outlined circle / filled square
const NODES = [
  'h-[10px] w-[10px] rounded-full bg-accent',
  'h-[10px] w-[10px] rotate-45 border border-accent',
  'h-[10px] w-[10px] rounded-full border border-accent',
  'h-[10px] w-[10px] bg-accent',
];

export default function PatentAccordion({ items }: { items: PatentItem[] }) {
  const [open, setOpen] = useState(-1); // single-open accordion

  const toggle = (i: number) => {
    setOpen((prev) => (prev === i ? -1 : i));
    if (soundOn()) blip(660, 0.04);
  };

  return (
    <div>
      {items.map((pat, i) => (
        <div key={pat.number} className="mb-4 overflow-hidden border border-line">
          <button
            type="button"
            onClick={() => toggle(i)}
            className="grid w-full grid-cols-[1fr_40px] items-center gap-6 px-7 py-[26px] text-left transition-colors hover:bg-accent/[0.06] md:grid-cols-[170px_1fr_40px]"
          >
            <span className="font-mono text-[13px] text-accent">{pat.number}</span>
            <span className="hidden text-[clamp(18px,2.2vw,28px)] font-bold tracking-[-0.01em] [font-stretch:112%] md:block">{pat.title}</span>
            <span className="text-right font-mono text-[20px] text-ink/60">{open === i ? '−' : '+'}</span>
            <span className="col-span-2 text-[clamp(18px,2.2vw,28px)] font-bold tracking-[-0.01em] [font-stretch:112%] md:hidden">{pat.title}</span>
          </button>
          {open === i && (
            <div className="grid animate-[rm-fadeup_0.4s_both] grid-cols-1 items-center gap-12 px-7 pb-8 pt-2 md:grid-cols-[1fr_300px]">
              <div>
                <p className="mb-5 max-w-[620px] text-[16px] leading-[1.65] text-ink/70">{pat.desc}</p>
                <div className="mb-5 font-mono text-[11px] tracking-[0.1em] text-accent">{pat.tags}</div>
                <a href={pat.href} className="border-b border-accent pb-[3px] font-mono text-[12px] tracking-[0.12em] text-ink no-underline transition-colors hover:text-accent">VIEW PATENT DETAILS →</a>
              </div>
              <div className="hidden items-center justify-between px-2 md:flex">
                {NODES.map((cls, n) => (
                  <Fragment key={n}>
                    <span className={cls} style={{ animation: `rm-pulse 2s infinite ${n * 0.4}s` }} />
                    {n < NODES.length - 1 && (
                      <span
                        className="h-px flex-1"
                        style={{ background: 'repeating-linear-gradient(90deg, rgba(245,165,36,0.6) 0 6px, transparent 6px 12px)' }}
                      />
                    )}
                  </Fragment>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create `src/components/home/PatentsSection.astro`** with exactly:

```astro
---
import { getCollection, type CollectionEntry } from 'astro:content';
import SectionHeader from './SectionHeader.astro';
import PatentAccordion from './islands/PatentAccordion';

const patents = (await getCollection('patents'))
  .sort((a: CollectionEntry<'patents'>, b: CollectionEntry<'patents'>) => a.id.localeCompare(b.id));
const items = patents.map((p: CollectionEntry<'patents'>) => ({
  number: p.data.patentNumber,
  title: p.data.title,
  desc: p.data.abstract,
  tags: p.data.tags.join(' · '),
  href: `/patents/${p.id}/`,
}));
---

<section id="patents" class="border-b border-line px-6 py-[140px] md:px-10">
  <div class="mx-auto max-w-site">
    <SectionHeader index="05" name="INTELLECTUAL PROPERTY" meta="USPTO · 4 GRANTED" />
    <h2 data-reveal class="h-display mb-16 text-[clamp(40px,5vw,76px)]">Systems that run themselves<span class="text-accent">.</span></h2>
    <div data-reveal>
      <PatentAccordion client:visible items={items} />
    </div>
  </div>
</section>
```

- [ ] **Step 3: Append to `src/pages/index.astro`** — import `PatentsSection` and render after `<Timeline />`:

```astro
import PatentsSection from '../components/home/PatentsSection.astro';
```

```astro
  <PatentsSection />
```

- [ ] **Step 4: Verify**

```bash
npm run build
```

Expected: success. Dev server: 4 accordion rows (amber patent number / bold title / + toggle); opening one closes any other; expanded panel fades+rises in with description, amber tag string, VIEW PATENT DETAILS → link to `/patents/<slug>/`, and the 4-node pulsing schematic with staggered pulses. Compare rows against the prototype's `patentData` (numbers US 10,951,542 B2 / US 11,157,269 B2 / US 12,086,648 B2 / US 11,954,504 B2) — if a collection entry's number or title differs, fix the collection frontmatter (prototype wins).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(revision): Patents section with single-open accordion island and pulsing schematic"
```

---

### Task 7: Field Notes + The Record + Transmit (email decoder)

**Files:**
- Create: `src/components/home/FieldNotes.astro`
- Create: `src/components/home/TheRecord.astro`
- Create: `src/components/home/islands/EmailDecoder.tsx`
- Create: `src/components/home/Transmit.astro`
- Modify: `src/lib/site.ts` (github URL + phone formatting per prototype)
- Modify: `src/pages/index.astro` (append sections)

**Interfaces:**
- Consumes: `.btn-outline`, `.btn-solid`, `.eyebrow` (Task 1); `site` from `src/lib/site.ts`.
- Produces: `EmailDecoder` React component (no props).

- [ ] **Step 1: Update `src/lib/site.ts`** — the prototype links GitHub as `dad2jrn` (matching the old footer) and formats the phone with spaces. Change:

```ts
  phone: '+1 804 695 4749',
```

and in `links`:

```ts
    github: 'https://github.com/dad2jrn',
```

**Do NOT remove the `email` field yet** — the resume page uses it (`mailto:` on a page is acceptable there? NO — Global Constraint says the address must never appear in delivered HTML on ANY page). Check usages:

```bash
grep -rn "site.email" src/
```

For each hit outside `src/lib/site.ts` (expected: `src/pages/resume.astro` line ~41): replace the mailto anchor with obfuscated assembly. In `resume.astro`, replace:

```astro
          <a href={`mailto:${site.email}`} class="hover:underline">{site.email}</a>
```

with:

```astro
          <a id="resume-email-link" href="#" class="hover:underline"></a>
```

and add at the bottom of `resume.astro` (before `<style>`):

```astro
<script>
  const codes = [114, 111, 110, 109, 101, 99, 107, 64, 103, 109, 97, 105, 108, 46, 99, 111, 109];
  const link = document.getElementById('resume-email-link');
  if (link) {
    const email = codes.map((c) => String.fromCharCode(c)).join('');
    link.setAttribute('href', `mailto:${email}`);
    link.textContent = email;
  }
</script>
```

Then delete the `email: 'ronmeck@gmail.com',` line from `src/lib/site.ts` and fix any remaining references the grep found.

- [ ] **Step 2: Create `src/components/home/FieldNotes.astro`** with exactly:

```astro
<section id="writing" class="border-b border-line px-6 py-[120px] md:px-10">
  <div class="mx-auto grid max-w-site grid-cols-1 items-center gap-[60px] md:grid-cols-2">
    <div>
      <div data-reveal class="eyebrow mb-7">06 / FIELD NOTES</div>
      <h2 data-reveal class="h-display m-0 text-[clamp(36px,4vw,60px)] leading-none">Writing on architecture &amp; resilient systems<span class="text-accent">.</span></h2>
    </div>
    <div data-reveal>
      <p class="mb-7 text-[17px] leading-[1.65] text-ink/60">Essays on enterprise architecture, cloud economics, and the discipline of building platforms that don't get to fail.</p>
      <a href="/writing/" class="btn-outline">READ THE WRITING →</a>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Create `src/components/home/TheRecord.astro`** with exactly:

```astro
---
import { site } from '../../lib/site';
---

<section id="resume" class="px-6 pb-[60px] pt-[120px] md:px-10">
  <div class="mx-auto max-w-site">
    <div data-reveal class="mb-12 flex items-baseline gap-5">
      <span class="eyebrow">07 / THE RECORD</span>
      <div class="h-px flex-1 bg-ink/[0.14]"></div>
    </div>
    <div data-reveal class="flex flex-wrap items-center justify-between gap-10 border border-line p-10">
      <div>
        <div class="mb-[10px] text-[28px] font-extrabold tracking-[-0.01em] [font-stretch:115%]">The full record, on paper.</div>
        <div class="mb-4 font-mono text-[12px] tracking-[0.1em] text-ink/50">ENTERPRISE ARCHITECTURE · CLOUD STRATEGY · GOVERNANCE · AWS · AZURE · CI/CD</div>
        <a href="/resume/" class="border-b border-accent pb-[3px] font-mono text-[12px] tracking-[0.12em] text-ink no-underline transition-colors hover:text-accent">VIEW HTML RESUME →</a>
      </div>
      <a href={site.links.resumePdf} class="btn-solid">DOWNLOAD PDF RESUME ↓</a>
    </div>
  </div>
</section>
```

- [ ] **Step 4: Create `src/components/home/islands/EmailDecoder.tsx`** with exactly:

```tsx
import { useEffect, useRef } from 'react';

const CHARS = '#$%&@*+=?!<>/\\0123456789ABCDEF';

// Assembled at runtime so the address never appears in the page source.
function email(): string {
  return (
    [114, 111, 110, 109, 101, 99, 107].map((c) => String.fromCharCode(c)).join('') +
    String.fromCharCode(64) +
    [103, 109, 97, 105, 108].map((c) => String.fromCharCode(c)).join('') +
    '.com'
  );
}

export default function EmailDecoder() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const target = email();
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        if (reduced) { el.textContent = target; return; }
        const t0 = performance.now();
        const dur = 1200;
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / dur);
          const settled = Math.floor(target.length * p); // left-to-right settle
          let out = target.slice(0, settled);
          for (let i = settled; i < target.length; i++) {
            out += CHARS[Math.floor(Math.random() * CHARS.length)];
          }
          el.textContent = out;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <a
      href="#contact"
      onClick={(e) => {
        e.preventDefault();
        window.location.href = 'mai' + 'lto:' + email();
      }}
      className="inline-block border-b-2 border-accent pb-[6px] font-mono text-[clamp(16px,2.4vw,28px)] tracking-[0.04em] text-ink no-underline transition-colors hover:text-accent"
    >
      <span ref={ref}>r*******@*****.***</span>
    </a>
  );
}
```

- [ ] **Step 5: Create `src/components/home/Transmit.astro`** with exactly:

```astro
---
import EmailDecoder from './islands/EmailDecoder';
import { site } from '../../lib/site';
---

<section id="contact" class="relative flex min-h-[90vh] flex-col justify-center overflow-hidden px-6 pb-40 pt-[140px] text-center md:px-10">
  <div class="relative">
    <div data-reveal class="eyebrow mb-8">08 / TRANSMIT</div>
    <h2 data-reveal class="mx-auto mb-12 max-w-[1100px] text-[clamp(48px,8vw,130px)] font-black uppercase leading-[0.92] tracking-[-0.03em] [font-stretch:122%]">Ready to modernize your enterprise<span class="text-accent">?</span></h2>
    <div data-reveal>
      <EmailDecoder client:visible />
    </div>
    <div data-reveal class="mt-10 flex flex-wrap justify-center gap-8 font-mono text-[12px] tracking-[0.1em]">
      <a href={site.links.linkedin} class="text-ink/60 no-underline transition-colors hover:text-accent">LINKEDIN</a>
      <a href={site.links.github} class="text-ink/60 no-underline transition-colors hover:text-accent">GITHUB</a>
      <a href={`tel:${site.phone.replace(/[^+\d]/g, '')}`} class="text-ink/60 no-underline transition-colors hover:text-accent">{site.phone}</a>
    </div>
  </div>
</section>
```

- [ ] **Step 6: Complete `src/pages/index.astro`** — final form:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import BootOverlay from '../components/home/BootOverlay.astro';
import HomeHero from '../components/home/HomeHero.astro';
import Origin from '../components/home/Origin.astro';
import Scale from '../components/home/Scale.astro';
import TheWork from '../components/home/TheWork.astro';
import Timeline from '../components/home/Timeline.astro';
import PatentsSection from '../components/home/PatentsSection.astro';
import FieldNotes from '../components/home/FieldNotes.astro';
import TheRecord from '../components/home/TheRecord.astro';
import Transmit from '../components/home/Transmit.astro';
---

<BaseLayout title="Enterprise Architect & Technology Leader">
  <BootOverlay />
  <HomeHero />
  <Origin />
  <Scale />
  <TheWork />
  <Timeline />
  <PatentsSection />
  <FieldNotes />
  <TheRecord />
  <Transmit />
</BaseLayout>
```

- [ ] **Step 7: Verify — including the email-never-in-source check**

```bash
npm run build
grep -ri "ronmeck@gmail" dist/ && echo "FAIL: email leaked" || echo "OK: email not in built HTML"
```

Expected: build succeeds; the grep prints `OK: email not in built HTML`. Dev server: email shows masked, scramble-decodes over 1.2s when scrolled into view, and clicking opens the mail client. All 8 sections + nav anchors (`/#work`, `/#patents`, `/#writing`, `/#resume`, `/#contact`) scroll to the right places.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(revision): Field Notes, The Record, and Transmit sections with scramble-decode email"
```

---

### Task 8: Custom cursor island (site-wide)

**Files:**
- Create: `src/components/home/islands/CustomCursor.tsx`
- Modify: `src/layouts/BaseLayout.astro` (mount it)

**Interfaces:**
- Consumes: `blip`/`soundOn` from `src/scripts/sound`.
- Produces: `<CustomCursor client:only="react" />` — `client:only` because the component reads `matchMedia` at render; SSR would mismatch.

- [ ] **Step 1: Create `src/components/home/islands/CustomCursor.tsx`** with exactly:

```tsx
import { useEffect, useRef, useState } from 'react';
import { blip, soundOn } from '../../../scripts/sound';

// Desktop-only custom cursor: 6px dot tracks exactly; 30px ring lerps behind
// and grows to 52px over links/buttons. Native cursor hidden only while mounted.
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    setActive(true);
  }, []);

  useEffect(() => {
    if (!active) return;
    const styleEl = document.createElement('style');
    styleEl.textContent = '* { cursor: none !important; }';
    document.head.appendChild(styleEl);

    let mx = -100, my = -100, rx = -100, ry = -100, raf = 0;
    const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
    const onOver = (e: MouseEvent) => {
      const target = e.target as Element;
      const hot = target.closest?.('a, button');
      const ring = ringRef.current;
      if (ring) {
        ring.style.width = hot ? '52px' : '30px';
        ring.style.height = hot ? '52px' : '30px';
      }
      if (hot && soundOn()) blip(1400, 0.02);
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseover', onOver, { passive: true });

    const loop = () => {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      const dot = dotRef.current;
      const ring = ringRef.current;
      if (dot) dot.style.transform = `translate(${mx - 3}px, ${my - 3}px)`;
      if (ring) {
        const s = parseFloat(ring.style.width) || 30;
        ring.style.transform = `translate(${rx - s / 2}px, ${ry - s / 2}px)`;
      }
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      styleEl.remove();
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
      cancelAnimationFrame(raf);
    };
  }, [active]);

  if (!active) return null;
  return (
    <>
      <div ref={dotRef} className="pointer-events-none fixed left-0 top-0 z-[200] h-[6px] w-[6px] rounded-full bg-accent" style={{ transform: 'translate(-100px, -100px)' }} />
      <div ref={ringRef} className="pointer-events-none fixed left-0 top-0 z-[200] h-[30px] w-[30px] rounded-full border border-accent opacity-60 [transition:width_0.2s,height_0.2s]" style={{ transform: 'translate(-100px, -100px)', width: '30px', height: '30px' }} />
    </>
  );
}
```

- [ ] **Step 2: Mount in `src/layouts/BaseLayout.astro`** — add to the frontmatter imports:

```astro
import CustomCursor from '../components/home/islands/CustomCursor.tsx';
```

and inside `<body>` right after the opening tag:

```astro
    <CustomCursor client:only="react" />
```

- [ ] **Step 3: Verify**

```bash
npm run build
```

Expected: success. Dev server (with a mouse): native cursor hidden; amber dot tracks exactly; ring trails with lerp and grows over nav links/buttons. In responsive/touch emulation mode: normal cursor behavior, no amber dot.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(revision): custom amber cursor island (pointer:fine only)"
```

---

### Task 9: Inner pages reskin

**Files:**
- Modify: `src/pages/work/index.astro`
- Modify: `src/pages/patents/index.astro`
- Modify: `src/pages/writing/index.astro`
- Modify: `src/pages/work/[slug].astro`
- Modify: `src/pages/patents/[slug].astro`
- Modify: `src/pages/writing/[slug].astro`
- Modify: `src/pages/404.astro`
- Modify: `src/pages/resume.astro`
- Modify: `src/components/PatentCard.astro`

**Interfaces:**
- Consumes: `.h-display`, `.eyebrow`, `.btn-solid`, `.label-mono` (Task 1). Colors flow automatically from the token remap — this task is structural: headline treatment, sharp corners, dead `dark:` variants, fixed-nav clearance.

- [ ] **Step 1: Headline + eyebrow treatment on list pages**

`src/pages/work/index.astro` — replace:
```astro
      <h1 class="text-5xl font-medium text-ink mb-8">Work</h1>
```
with:
```astro
      <div class="eyebrow mb-8">/ WORK</div>
      <h1 class="h-display mb-8 text-[clamp(48px,7vw,96px)] text-ink">Work</h1>
```

`src/pages/patents/index.astro` — replace:
```astro
        <h1 class="text-5xl md:text-6xl font-medium text-ink mb-8 tracking-tight">
```
with:
```astro
        <div class="eyebrow mb-8">/ INTELLECTUAL PROPERTY</div>
        <h1 class="h-display mb-8 text-[clamp(48px,7vw,96px)] text-ink">
```
and replace its `<h2 class="text-2xl font-medium text-ink mb-6">` with `<h2 class="mb-6 text-[24px] font-extrabold uppercase tracking-[-0.01em] text-ink [font-stretch:115%]">`.

`src/pages/writing/index.astro` — replace:
```astro
      <h1 class="text-5xl font-medium text-ink mb-8">Writing</h1>
```
with:
```astro
      <div class="eyebrow mb-8">/ FIELD NOTES</div>
      <h1 class="h-display mb-8 text-[clamp(48px,7vw,96px)] text-ink">Writing</h1>
```
and in its post list, replace `<h2 class="text-3xl font-medium text-ink group-hover:text-accent transition-colors mb-4">` with `<h2 class="mb-4 text-[28px] font-extrabold tracking-[-0.01em] text-ink transition-colors group-hover:text-accent [font-stretch:112%]">`.

- [ ] **Step 2: Detail pages**

In each of `src/pages/work/[slug].astro`, `src/pages/patents/[slug].astro`, `src/pages/writing/[slug].astro`, replace the h1:
```astro
        <h1 class="text-4xl md:text-6xl font-medium text-ink mb-8 leading-[1.1] tracking-tight">
```
with:
```astro
        <h1 class="h-display mb-8 text-[clamp(36px,5vw,72px)] text-ink">
```
(The `label-mono` eyebrows above them keep working — in `patents/[slug].astro` the patent number eyebrow already has `text-accent`; leave it.)

- [ ] **Step 3: Sharp corners + dead dark variants sweep**

```bash
grep -rn "rounded" src/pages/ src/components/PatentCard.astro src/components/ExperienceTimeline.astro src/components/CaseStudyVisual.astro
grep -rn "dark:" src/
```

For every `rounded-*` hit in those files: delete the class (these are card/button/chip roundings — `rounded`, `rounded-lg`, `rounded-full` on pill buttons become square per the design). For every `dark:` hit: delete just the `dark:*` class. Do NOT touch `src/components/home/` or `Nav.astro`/`Footer.astro` (their `rounded-full` dots/rings are intentional).

Old pill buttons become `.btn-solid`. In `src/pages/404.astro`, replace:
```astro
      <a href="/" class="inline-flex h-12 items-center justify-center rounded-full bg-ink px-8 text-sm font-medium text-surface hover:bg-accent transition-colors">
        Back to home
      </a>
```
with:
```astro
      <a href="/" class="btn-solid">BACK TO HOME →</a>
```
Also in `404.astro` replace the h1 line `<h1 class="text-4xl md:text-6xl font-medium text-ink mb-8 leading-tight">` with `<h1 class="h-display mb-8 text-[clamp(36px,5vw,72px)] text-ink">` and change `<div class="label-mono mb-8">Error 404</div>` to `<div class="eyebrow mb-8">ERROR 404</div>`.

Any other old-style pill/CTA link found by the grep (e.g. remaining `rounded-full bg-ink ... hover:bg-accent` anchors) gets the same `.btn-solid` treatment with its label uppercased.

- [ ] **Step 4: Fixed-nav clearance on inner pages**

The nav is now fixed and overlays content. Check the first section of each inner page: it needs top padding ≥ `pt-24`. `work/index`, `patents/index`, `writing/index`, and the detail pages use `py-24`/`py-32` — fine. `src/pages/resume.astro` uses `py-12 md:py-20` — replace with `pt-28 pb-12 md:pt-32 md:pb-20`.

- [ ] **Step 5: Resume page paper treatment**

`src/pages/resume.astro` stays a white paper document (it prints; black-on-white is correct). Two changes beyond Steps 3–4 and the email fix from Task 7:
1. Replace the download banner block (the `no-print` div) with:
```astro
      <div class="mb-12 border border-gray-300 p-6 text-center no-print">
        <p class="mb-4 text-gray-700">Need a PDF version for your records?</p>
        <a href={site.links.resumePdf} download class="inline-block bg-[#F5A524] px-8 py-[14px] font-mono text-[13px] font-bold tracking-[0.12em] text-black no-underline transition-transform hover:-translate-y-[3px]">DOWNLOAD PDF RESUME ↓</a>
      </div>
```
(The old block used `bg-surface-sunken`/`text-ink-muted`, which are now dark-theme colors — wrong on the white sheet.)
2. The sheet's `font-serif` now resolves to Instrument Serif (imported in Task 1) — view the page and confirm it reads well; keep it.

- [ ] **Step 6: `src/components/PatentCard.astro`** — apply the Step 3 sweep results (drop its `rounded*` and `dark:*` classes); everything else is token-driven. Give `/patents/` and `/work/` a visual once-over in the dev server: hairlines, amber accents, dark background, no leftover teal or light-mode remnants.

- [ ] **Step 7: Verify**

```bash
npm run build
grep -rn "dark:" src/ | grep -v node_modules
grep -rn "font-display" src/
```

Expected: build succeeds; both greps return nothing (if `font-display` appears anywhere, delete the class — Archivo is now the default sans). Browse every inner page at desktop and ~375px: `/work/`, `/work/capital-one-payments-platform/`, `/patents/`, `/patents/01-operational-schedules/`, `/writing/`, `/writing/first-essay/`, `/resume/`, and a bogus URL for the 404.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(revision): reskin inner pages — display headlines, sharp corners, fixed-nav clearance"
```

---

### Task 10: Contact redirect + dependency and dead-code cleanup

**Files:**
- Modify: `astro.config.mjs` (redirect)
- Delete: `src/pages/contact.astro`
- Modify: `src/styles/global.css` (drop the dark `@custom-variant`)
- Modify: `package.json` (via npm)

**Interfaces:** none new.

- [ ] **Step 1: Add the redirect in `astro.config.mjs`** — add to the `defineConfig` object:

```js
  redirects: {
    '/contact': '/#contact',
  },
```

- [ ] **Step 2: Delete the contact page**

```bash
git rm src/pages/contact.astro
```

- [ ] **Step 3: Remove the dark-variant shim** — delete the `@custom-variant dark (&:where(.dark, .dark *));` line (and its comment) from `src/styles/global.css`; Task 9 removed the last `dark:` variants, so nothing references it.

- [ ] **Step 4: Drop unused dependencies**

```bash
grep -rn "framer-motion" src/
grep -rn "lucide-react" src/
```

For each package with no hits, uninstall it:

```bash
npm uninstall framer-motion
```

(and `npm uninstall lucide-react` if it also has no hits — check `VDOTArchitectureDiagram.tsx` first; if it imports lucide icons, keep it.)

- [ ] **Step 5: Verify**

```bash
npm run build
ls dist/contact/
```

Expected: build succeeds; `dist/contact/index.html` exists and contains a meta-refresh/redirect to `/#contact` (check with `grep -o 'url=[^"]*' dist/contact/index.html`).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(revision): redirect /contact to /#contact, drop theme machinery and unused deps"
```

---

### Task 11: Final verification pass

**Files:**
- Modify: `package.json` (add check tooling)
- Possibly small fixes anywhere.

- [ ] **Step 1: Type-check the project**

```bash
npm install -D @astrojs/check typescript
npx astro check
```

Expected: 0 errors (warnings acceptable; fix errors before proceeding).

- [ ] **Step 2: Clean build + email leak check**

```bash
npm run build
grep -ri "ronmeck@gmail" dist/ && echo "FAIL: email leaked" || echo "OK"
```

Expected: `OK`.

- [ ] **Step 3: Full browser pass** (dev server, side-by-side with `design_handoff_ronmeck_site/Ron Meck.dc.html` opened directly in the browser)

Desktop (~1440px):
- Boot overlay: 5 staggered lines, fade ~2.6s, plays once per session (reload same tab: skipped; new tab: plays)
- Hero: particle field clearly visible but not overbearing (tune `LINE_ALPHA`/`DOT_SIZE`/`DOT_ALPHA` in `ParticleField.tsx` if needed); marquee loops seamlessly; pulsing AVAILABLE dot
- Nav: difference blend inverts over the paper Origin section; progress bar tracks scroll; every anchor lands on its section — including from an inner page like `/work/` (loads `/` then scrolls)
- Sections 01–08 match the prototype: paper Origin, count-up stats, scanline work cards (hover: amber border + lift), 10 timeline rows (hover: tint + slide), single-open patent accordion with pulsing schematic, Field Notes, The Record banner (PDF downloads), Transmit headline + email decode + LINKEDIN/GITHUB/PHONE
- Custom cursor: dot + lerping ring, ring grows over links; sound toggle ON → hover blips (1400Hz), patent toggle blips (660Hz), enable confirm (880Hz)
- Footer: uptime ticks each second

Mobile (~375px, touch emulation):
- No custom cursor; nav links hidden (wordmark only); stats 2×2; grids stacked; timeline rows stacked; everything readable, no horizontal scroll

Reduced motion (devtools → emulate `prefers-reduced-motion`):
- No boot overlay, no reveal animations (content just visible), stats show final values, email reveals without scramble, marquee/scanlines/pulses effectively static

- [ ] **Step 4: Commit any fixes**

```bash
git add -A
git commit -m "fix(revision): final verification pass fixes"
```

(Skip the commit if nothing changed.)

---

## Post-plan

After all tasks pass, use the **superpowers:finishing-a-development-branch** skill to decide merge/PR for `revision`.

Deferred (do not do now): mouse-responsive particle field brainstorm; the `TODO(deferred)` marker lives in `ParticleField.tsx`.
