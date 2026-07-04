# Resume: Dual PDF Downloads + Terminal-Themed HTML Resume Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let visitors download either a standard or an ATS-friendly resume PDF from "The Record," and re-theme the `/resume` HTML page to look like a terminal readout matching the rest of the site instead of a plain white print page.

**Architecture:** Add a second PDF link to the shared `site.ts` config and wire it into two existing button-style CTAs (`.btn-solid` / `.btn-outline`) on both the homepage "The Record" section and the `/resume` page itself. Re-theme `/resume` by reusing existing site components/tokens: `ParticleField` (canvas background), `Greebles` (`CornerHandles`, `LockBox`, `ArrayChip`, `StatusDots`), `SectionHeader.astro`, and the dark `ink`/`surface`/`accent`/`tag-chip` design tokens already used elsewhere. Printed output keeps its own forced white/black styling via `@media print`, independent of the on-screen dark theme.

**Tech Stack:** Astro 7 (`.astro` components + content collections), React 19 islands (`client:idle` for canvas-based components only), Tailwind CSS 4 (`@theme` tokens in `src/styles/global.css`). No test framework in this repo — verification is `npm run check` / `npm run build` plus a manual browser/print pass, matching the existing project convention.

## Global Constraints

- No new npm dependencies and no new client-side JS beyond what's already shipped (`ParticleField`'s existing `client:idle` island). The two-button CTAs are plain `<a>` tags — no toggle/JS.
- Reuse existing design system pieces instead of duplicating styles: `.btn-solid`, `.btn-outline`, `.tag-chip`, `border-line`, `CornerHandles`/`LockBox`/`ArrayChip`/`StatusDots` from `src/components/home/islands/boot/Greebles.tsx`, `SectionHeader.astro`, `ParticleField.tsx`.
- All decorative/HUD elements on `/resume` (particle canvas, corner handles, stamps, footer status strip) must be `aria-hidden="true"` and scoped so they never render in print output.
- The existing `@media print` rules in `src/styles/global.css` (forces `html, body { background: white !important; color: black !important; }`, hides `.no-print`, hides `nav`/`footer`) remain the baseline and must not be removed — only extended where the new dark-theme utility classes would otherwise leak through into printed output.
- `npm run check` (astro check) and `npm run build` must both pass with no new errors after each task.

---

### Task 1: Point resume links at the new PDFs and retire the stale one

**Files:**
- Modify: `src/lib/site.ts:9`
- Delete: `public/Ron_Meck_Resume.pdf`

**Interfaces:**
- Produces: `site.links.resumePdf: string` (now points at `/Ron_Meck_Enterprise_Architect_Resume.pdf`) and `site.links.resumePdfAts: string` (new, points at `/Ron_Meck_Enterprise_AI_Architect_ATS.pdf`) — consumed by Task 2 and Task 3.

- [ ] **Step 1: Update `site.ts` links**

In `src/lib/site.ts`, replace:

```ts
    resumePdf: '/Ron_Meck_Resume.pdf',
```

with:

```ts
    resumePdf: '/Ron_Meck_Enterprise_Architect_Resume.pdf',
    resumePdfAts: '/Ron_Meck_Enterprise_AI_Architect_ATS.pdf',
```

- [ ] **Step 2: Delete the stale PDF**

```bash
git rm public/Ron_Meck_Resume.pdf
```

- [ ] **Step 3: Confirm nothing else references the old file**

```bash
grep -rn "Ron_Meck_Resume.pdf" src public astro.config.mjs
```

Expected: no output (no matches). If anything matches, update it before continuing.

- [ ] **Step 4: Type-check**

```bash
npm run check
```

Expected: no new errors. (`resumePdfAts` is a plain string property on a `const ... as const` object — no schema/type changes needed elsewhere.)

- [ ] **Step 5: Commit**

```bash
git add src/lib/site.ts
git commit -m "$(cat <<'EOF'
feat(resume): point resume link at updated PDF, add ATS-friendly link

Ron_Meck_Resume.pdf (Apr) is superseded by the new
Ron_Meck_Enterprise_Architect_Resume.pdf. Also adds a link to the new
ATS-friendly resume PDF for the next task to wire up.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Add the ATS-friendly download button to "The Record"

**Files:**
- Modify: `src/components/home/TheRecord.astro:17`

**Interfaces:**
- Consumes: `site.links.resumePdf: string`, `site.links.resumePdfAts: string` (from Task 1).

- [ ] **Step 1: Replace the single download link with two buttons**

In `src/components/home/TheRecord.astro`, replace:

```astro
      <a href={site.links.resumePdf} class="btn-solid">DOWNLOAD PDF RESUME ↓</a>
```

with:

```astro
      <div class="flex flex-wrap items-center gap-4">
        <a href={site.links.resumePdf} class="btn-solid">DOWNLOAD PDF RESUME ↓</a>
        <a href={site.links.resumePdfAts} class="btn-outline">ATS-FRIENDLY VERSION ↓</a>
      </div>
```

The parent container (`class="flex flex-wrap items-center justify-between gap-10 border border-line p-10"`) already wraps on narrow viewports, so no other layout change is needed.

- [ ] **Step 2: Visual check**

```bash
npm run dev
```

Open `http://localhost:4321/#resume` (or the port shown) at desktop width and at ~375px width. Confirm both buttons render side by side (wrapping to stacked on narrow viewports), and each points at the correct PDF (check the `href` in devtools, or click through and confirm the filename in the browser's download).

- [ ] **Step 3: Type-check**

```bash
npm run check
```

Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/home/TheRecord.astro
git commit -m "$(cat <<'EOF'
feat(resume): add ATS-friendly resume download to The Record

Gives visitors a choice between the standard PDF resume and an
ATS-friendly version, as two CTAs reusing the existing
btn-solid/btn-outline styles.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Re-theme `/resume` as a terminal readout

**Files:**
- Modify: `src/pages/resume.astro` (full rewrite of the template body; frontmatter logic — `getCollection`, `sortedExperience`, `formatDate`, `skills` — is unchanged)

**Interfaces:**
- Consumes: `site.links.resumePdf`, `site.links.resumePdfAts` (Task 1); `SectionHeader` props `{ index: string; name: string; meta?: string; paper?: boolean }` from `src/components/home/SectionHeader.astro`; default export `ParticleField` (no props) from `src/components/home/islands/ParticleField`; named exports `CornerHandles()`, `LockBox({ code: string })`, `ArrayChip({ tag: string; code: string })`, `StatusDots({ reduced: boolean })` from `src/components/home/islands/boot/Greebles`.
- Produces: nothing consumed by later tasks (this is the last task in the plan).

**Why a full-file rewrite:** the on-screen theme, panel structure, header, every section, the CTAs, and the print overrides all change together and render as one page — there's no meaningful way to review "just the header" separately from "just the skills section." One task, reviewed as a whole page.

- [ ] **Step 1: Replace the whole file**

Replace the entire contents of `src/pages/resume.astro` with:

```astro
---
import { getCollection, type CollectionEntry } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import SectionHeader from '../components/home/SectionHeader.astro';
import ParticleField from '../components/home/islands/ParticleField';
import { CornerHandles, LockBox, ArrayChip, StatusDots } from '../components/home/islands/boot/Greebles';
import { site } from '../lib/site';

const experience = await getCollection('experience');
const sortedExperience = experience.sort((a: CollectionEntry<'experience'>, b: CollectionEntry<'experience'>) => a.data.order - b.data.order);

const featuredExperience = sortedExperience.filter(e => e.data.featured);
const previousExperience = sortedExperience.filter(e => !e.data.featured);

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length < 2) return dateStr; // Return as is if not YYYY-MM
  const [year, month] = parts;
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-US', { month: '2-digit', year: 'numeric' });
};

const skills = {
  hard: ["Enterprise Architecture", "Cloud Strategy", "Product Management", "Agile Methodologies", "Budgeting & Forecasting", "Risk Management"],
  techniques: ["CI/CD", "Vendor Selection", "Resource Optimization", "Governance Frameworks"],
  tools: ["AWS", "Azure", "Jira", "Confluence", "Playwright", "Astro"]
};
---

<BaseLayout title="Resume">
  <section class="relative overflow-hidden px-6 pb-[100px] pt-28 md:px-10 md:pt-32">
    <div class="no-print pointer-events-none absolute inset-0 opacity-40" aria-hidden="true">
      <ParticleField client:idle />
    </div>
    <div
      class="no-print pointer-events-none absolute inset-0 [background:radial-gradient(ellipse_at_50%_0%,rgba(10,10,11,0)_40%,rgba(10,10,11,0.92)_100%)]"
      aria-hidden="true"
    ></div>

    <div class="relative mx-auto max-w-[850px]">
      <div class="resume-panel relative border border-line bg-surface-raised/80 p-8 backdrop-blur-sm sm:p-12">
        <div class="no-print" aria-hidden="true">
          <CornerHandles />
        </div>
        <div class="no-print absolute -top-3 right-8" aria-hidden="true">
          <LockBox code="RM97" />
        </div>

        <!-- Header -->
        <header class="mb-12 text-center">
          <div class="mb-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-mono text-[12px] tracking-[0.14em] text-ink/50">
            <span>{site.location}</span>
            <span class="text-accent">&#9670;</span>
            <a href={`tel:${site.phone.replace(/\s+/g, '')}`} class="transition-colors hover:text-accent">{site.phone}</a>
            <span class="text-accent">&#9670;</span>
            <a id="resume-email-link" href="#" class="transition-colors hover:text-accent"></a>
            <span class="text-accent">&#9670;</span>
            <a href={site.links.linkedin} class="transition-colors hover:text-accent">LinkedIn</a>
          </div>
          <h1 class="h-display m-0 text-[clamp(34px,6vw,60px)]">{site.name}</h1>
          <p class="mx-auto mt-3 max-w-[520px] font-serif text-[20px] italic leading-snug text-ink/85">{site.tagline}</p>
        </header>

        <!-- Download Action (Hidden in PDF) -->
        <div class="no-print mb-12 flex flex-wrap items-center justify-center gap-4 border border-line p-6 text-center">
          <p class="m-0 mb-2 w-full font-mono text-[12px] tracking-[0.1em] text-ink/50">NEED A PDF FOR YOUR RECORDS?</p>
          <a href={site.links.resumePdf} download class="btn-solid">DOWNLOAD PDF RESUME &#8595;</a>
          <a href={site.links.resumePdfAts} download class="btn-outline">ATS-FRIENDLY VERSION &#8595;</a>
        </div>

        <div class="space-y-14">
          <!-- Work Experience -->
          <section>
            <SectionHeader index="01" name="WORK EXPERIENCE" />
            <div class="space-y-10">
              {featuredExperience.map((entry: CollectionEntry<'experience'>) => (
                <div>
                  <div class="mb-1 flex flex-wrap items-baseline justify-between gap-2">
                    <h3 class="text-[17px] font-bold text-ink">{entry.data.company}</h3>
                    <span class="font-mono text-[12px] tracking-[0.08em] text-ink/50">{formatDate(entry.data.startDate)} &ndash; {entry.data.endDate ? formatDate(entry.data.endDate) : 'Present'}</span>
                  </div>
                  <div class="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                    <span class="font-serif text-[16px] italic text-ink/85">{entry.data.role}</span>
                    <span class="font-mono text-[12px] tracking-[0.08em] text-ink/40">{entry.data.location}</span>
                  </div>
                  <p class="mb-4 text-[14px] leading-relaxed text-ink-muted">
                    {entry.data.summary}
                  </p>
                  <ul class="ml-5 list-disc space-y-2 text-[14px] marker:text-accent">
                    {entry.data.achievements?.map((achievement: string) => (
                      <li class="pl-1 leading-relaxed text-ink-muted">
                        {achievement}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <!-- Previous Experience -->
          {previousExperience.length > 0 && (
            <section>
              <SectionHeader index="02" name="PREVIOUS EXPERIENCE" />
              <div class="space-y-3">
                {previousExperience.map((entry: CollectionEntry<'experience'>) => (
                  <div class="grid grid-cols-[1fr_auto] items-baseline gap-4 text-[14px]">
                    <div class="truncate">
                      <span class="font-bold text-ink">{entry.data.role}</span>
                      <span class="mx-1 text-ink/30">|</span>
                      <span class="font-semibold text-ink/80">{entry.data.company}</span>
                      <span class="mx-1 text-ink/30">|</span>
                      <span class="italic text-ink/50">{entry.data.location}</span>
                    </div>
                    <span class="whitespace-nowrap font-mono text-[12px] tracking-[0.08em] text-ink/50">
                      {formatDate(entry.data.startDate)} &ndash; {entry.data.endDate ? formatDate(entry.data.endDate) : 'Present'}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <!-- Skills -->
          <section>
            <SectionHeader index="03" name="SKILLS" />
            <div class="relative space-y-5">
              <div class="no-print absolute -right-2 -top-2 hidden sm:block" aria-hidden="true">
                <ArrayChip tag="SKL" code="6YT" />
              </div>
              <div>
                <div class="mb-2 font-mono text-[11px] tracking-[0.1em] text-ink/40">HARD SKILLS</div>
                <div class="flex flex-wrap gap-2">
                  {skills.hard.map((s) => <span class="tag-chip">{s}</span>)}
                </div>
              </div>
              <div>
                <div class="mb-2 font-mono text-[11px] tracking-[0.1em] text-ink/40">TECHNIQUES</div>
                <div class="flex flex-wrap gap-2">
                  {skills.techniques.map((s) => <span class="tag-chip">{s}</span>)}
                </div>
              </div>
              <div>
                <div class="mb-2 font-mono text-[11px] tracking-[0.1em] text-ink/40">TOOLS AND SOFTWARE</div>
                <div class="flex flex-wrap gap-2">
                  {skills.tools.map((s) => <span class="tag-chip">{s}</span>)}
                </div>
              </div>
            </div>
          </section>

          <!-- Education -->
          <section>
            <SectionHeader index="04" name="EDUCATION" />
            <div class="flex flex-wrap items-baseline justify-between gap-2 text-[14px]">
              <div>
                <h3 class="text-[16px] font-bold text-ink">Strayer University</h3>
                <p class="italic text-ink/70">B.S. Information Systems</p>
              </div>
              <span class="font-mono text-[12px] tracking-[0.08em] text-ink/50">Richmond, VA</span>
            </div>
          </section>
        </div>

        <!-- Footer status strip -->
        <div class="no-print mt-14 border-t border-line pt-4" aria-hidden="true">
          <div class="flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] tracking-[0.1em] text-ink/40">
            <div class="flex items-center gap-3">
              <StatusDots reduced={false} />
              <span>TTY/2 :: RESUME EXPORT</span>
            </div>
            <span class="text-accent">RECORD VERIFIED &middot; RM97-2607</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</BaseLayout>

<script>
  const codes = [114, 111, 110, 109, 101, 99, 107, 64, 103, 109, 97, 105, 108, 46, 99, 111, 109];
  const link = document.getElementById('resume-email-link');
  if (link) {
    const email = codes.map((c) => String.fromCharCode(c)).join('');
    link.setAttribute('href', `mailto:${email}`);
    link.textContent = email;
  }
</script>

<style>
  @media print {
    .no-print {
      display: none !important;
    }
    section {
      padding-top: 0 !important;
      padding-bottom: 0 !important;
    }
    .container-site {
      max-width: 100% !important;
      padding: 0 !important;
    }
    /* The dark on-screen theme (text-ink, text-accent, bg-surface-raised, etc.)
       sets color/background directly on individual elements, which the global
       `html, body { color: black !important }` print rule does not override
       (inherited values only apply where an element has no rule of its own).
       Force everything inside the panel back to plain black-on-white here. */
    .resume-panel,
    .resume-panel * {
      color: #000 !important;
      background: transparent !important;
      border-color: #000 !important;
      backdrop-filter: none !important;
    }
    .resume-panel li::marker {
      color: #000 !important;
    }
  }
</style>
```

- [ ] **Step 2: Type-check**

```bash
npm run check
```

Expected: no new errors. If it complains about the `Greebles` import path, confirm the file is at `src/components/home/islands/boot/Greebles.tsx` (it is — verified during brainstorming) and that the import in `resume.astro` uses the exact same relative path style as other imports in the file (`../` segments, no extension).

- [ ] **Step 3: Build**

```bash
npm run build
```

Expected: build succeeds with no errors.

- [ ] **Step 4: Manual browser pass**

```bash
npm run dev
```

Visit `/resume` and confirm:
- Dark background with the particle field visible but subdued behind the panel; panel text is legible over it.
- Corner handles visible at the panel's four corners; the `RM97` lock badge near the top-right of the panel; the `SKL` array chip near the Skills heading; the footer status strip with pulsing status dots at the bottom of the panel.
- Header shows location / phone / decoded email / LinkedIn as a single mono line (the email should resolve to a real address, not the raw character codes — check the page source does **not** contain the plain-text email).
- Both download buttons work and point at the two distinct PDFs.
- Skills render as pill chips grouped under Hard Skills / Techniques / Tools and Software.
- Resize to ~375px: everything wraps/stacks without overlap.

- [ ] **Step 5: Manual print pass**

In the browser, open print preview (Cmd+P) for `/resume`. Confirm:
- Plain white background, black text throughout (no near-white or amber text surviving from the on-screen theme).
- No particle field, no corner handles, no lock badge, no array chip, no footer status strip, no download buttons.
- Nav and footer are hidden, matching the site-wide print rule.

- [ ] **Step 6: Commit**

```bash
git add src/pages/resume.astro
git commit -m "$(cat <<'EOF'
feat(resume): re-theme HTML resume as a dark terminal readout

Replaces the plain white/serif print-page styling with the site's
dark ink/surface/accent theme: particle field background, a bordered
panel with corner-handle and HUD-widget greeblies, SectionHeader-style
section eyebrows, and tag-chip skill pills. Print output is
unaffected — the existing forced white/black print rule is extended
so the new dark-theme utility colors don't leak through onto paper.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```
