# ronmeck.dev

Personal site for Ron Meck — enterprise architect. A single cinematic scrolling homepage (terminal boot gate → particle-field hero → chaptered sections → scramble-decode contact) with detail pages for case studies, patents, writing, and an HTML/print resume.

## Stack

- [Astro 7](https://astro.build) (static output, Content Layer collections)
- React 19.2 islands for the interactive pieces (particle field, patent accordion, email decoder, custom cursor)
- Tailwind CSS 4.3 (CSS-first config — the design tokens live in the `@theme` block in `src/styles/global.css`; there is no `tailwind.config`)
- Self-hosted fonts via @fontsource: Archivo (variable width), JetBrains Mono, Instrument Serif

## Commands

| Command | Action |
| --- | --- |
| `npm install` | Install dependencies (Node ≥ 22 required) |
| `npm run dev` | Dev server at `localhost:4321` |
| `npm run build` | Production build to `./dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run check` | Type-check (`astro check`) |

## Content

All page data is driven by Content Layer collections in `src/content/` (schemas in `src/content.config.ts`):

- `experience/` — career timeline rows + resume entries
- `patents/` — USPTO patents (homepage accordion + detail pages)
- `case-studies/` — featured work cards + `/work/*` pages
- `writing/` — essays at `/writing/*`

The contact email never appears in source or built HTML — it is assembled from character codes at runtime.

## Deploy

GitHub Actions (`.github/workflows/deploy.yml`) builds on Node 22 and publishes `dist/` to GitHub Pages. `PUBLIC_GIT_SHA` is injected at build time for the footer's build line.

## Design record

The redesign's spec and implementation plan live in `docs/superpowers/`; the original design handoff (pixel reference prototype) is in `design_handoff_ronmeck_site/`.
