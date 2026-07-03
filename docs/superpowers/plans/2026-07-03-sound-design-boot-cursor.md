# Sound Design, Boot Overlay Replay, Cursor Inversion — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 2Advanced-style audio layer (looping ambient music + sampled UI sounds from `public/sounds/`), boot overlay replaying on every home-page load, and a cursor that inverts to black over solid accent surfaces.

**Architecture:** Extend the existing WebAudio module `src/scripts/sound.ts` (shared state on `window.__rmSound`) with fetched/decoded `AudioBuffer` samples (`sfx(name)`) and a looping music source. Wire call sites in the existing islands/components. Boot overlay drops its sessionStorage gate. Cursor gets Tailwind's `mix-blend-difference`.

**Tech Stack:** Astro 7 (static output), React 19 islands, Tailwind 4, WebAudio API. No new dependencies.

## Global Constraints

- No new npm dependencies.
- Sound files already exist in `public/sounds/` and are served at `/sounds/<file>.ogg`.
- Every playback path must self-gate on the ON flag and swallow audio errors (`try`/`.catch`) — audio failure must never break the page.
- The spec is `docs/superpowers/specs/2026-07-03-sound-design-boot-cursor-design.md`.
- No JS test framework exists. Each task verifies with `npm run build` (must exit 0) plus targeted real-browser checks with `npm run dev`. The executor cannot hear audio — verify code paths via DevTools console/network assertions described in each task; the final human listening pass is Task 7.
- Commit after every task.

---

### Task 1: Sound engine — samples + music loop in `src/scripts/sound.ts`

**Files:**
- Modify: `src/scripts/sound.ts` (full replacement below)

**Interfaces:**
- Consumes: nothing new. Existing importers use `blip(freq, gain)`, `soundOn()`, `setSound(on)` — all keep their signatures.
- Produces (later tasks rely on these exact names):
  - `export type SfxName = 'hover' | 'click' | 'open' | 'deny' | 'boot' | 'launch' | 'type'`
  - `export function sfx(name: SfxName): void` — fire-and-forget; self-gates on the ON flag.
  - `export function startMusic(): void` / `export function stopMusic(): void`
  - Global click sound: any click on `a`/`button` plays `click`, EXCEPT elements inside `[data-sfx-silent]` (used by later tasks to avoid doubled sounds).
  - ON flag now persists in `sessionStorage` key `rm-sound` (`'on'`/`'off'`) so SOUND·OFF survives MPA navigation — without this, the music loop would blare again on every page change after the user muted it.

- [ ] **Step 1: Replace `src/scripts/sound.ts` with:**

```ts
// WebAudio engine: sampled UI sounds + ambient music loop + legacy sine blips.
// On by default; the nav toggle flips it. State lives on window so every
// bundle (Astro scripts, React islands) shares it; the ON flag persists
// across page loads in sessionStorage.

export type SfxName = 'hover' | 'click' | 'open' | 'deny' | 'boot' | 'launch' | 'type';

type RMSound = {
  on: boolean;
  ctx?: AudioContext;
  unlockBound?: boolean;
  clickBound?: boolean;
  buffers?: Map<string, Promise<AudioBuffer>>;
  musicSrc?: AudioBufferSourceNode;
};

declare global {
  interface Window { __rmSound?: RMSound }
}

const SFX: Record<SfxName, { url: string; gain: number }> = {
  hover: { url: '/sounds/hover.ogg', gain: 0.35 },
  click: { url: '/sounds/buttonpress1.ogg', gain: 0.5 },
  open: { url: '/sounds/open.ogg', gain: 0.5 },
  deny: { url: '/sounds/deny.ogg', gain: 0.5 },
  boot: { url: '/sounds/PixelAnimate.ogg', gain: 0.6 },
  launch: { url: '/sounds/deephit-withglitch.ogg', gain: 0.7 },
  type: { url: '/sounds/typearrayloop.ogg', gain: 0.4 },
};

const MUSIC_URL = '/sounds/mainLoop.ogg';
const MUSIC_GAIN = 0.25;

function store(): RMSound {
  if (!window.__rmSound) {
    let on = true;
    try { on = sessionStorage.getItem('rm-sound') !== 'off'; } catch { /* private mode */ }
    window.__rmSound = { on };
  }
  return window.__rmSound;
}

function ctx(): AudioContext {
  const s = store();
  if (!s.ctx) s.ctx = new AudioContext();
  return s.ctx;
}

function loadBuffer(url: string): Promise<AudioBuffer> {
  const s = store();
  if (!s.buffers) s.buffers = new Map();
  let p = s.buffers.get(url);
  if (!p) {
    p = fetch(url).then((r) => r.arrayBuffer()).then((data) => ctx().decodeAudioData(data));
    s.buffers.set(url, p);
  }
  return p;
}

function playBuffer(buffer: AudioBuffer, gain: number, loop = false): AudioBufferSourceNode {
  const c = ctx();
  const src = c.createBufferSource();
  src.buffer = buffer;
  src.loop = loop;
  const g = c.createGain();
  g.gain.value = gain;
  src.connect(g);
  g.connect(c.destination);
  src.start();
  return src;
}

export function sfx(name: SfxName): void {
  try {
    if (!store().on) return;
    const { url, gain } = SFX[name];
    const c = ctx();
    loadBuffer(url).then((buf) => {
      if (!store().on) return;
      if (c.state === 'suspended') {
        // Never schedule one-shots into a suspended context (they would pile
        // up and fire stale); resume first — rejects harmlessly pre-gesture.
        c.resume().then(() => playBuffer(buf, gain)).catch(() => {});
        return;
      }
      playBuffer(buf, gain);
    }).catch(() => {});
  } catch { /* audio unavailable */ }
}

export function startMusic(): void {
  try {
    const s = store();
    if (!s.on || s.musicSrc) return;
    loadBuffer(MUSIC_URL).then((buf) => {
      const s2 = store();
      if (!s2.on || s2.musicSrc) return;
      // Unlike one-shots, starting a loop into a suspended context is what we
      // want: it begins the instant autoplay is granted or a gesture resumes.
      s2.musicSrc = playBuffer(buf, MUSIC_GAIN, true);
      ctx().resume().catch(() => {});
    }).catch(() => {});
  } catch { /* audio unavailable */ }
}

export function stopMusic(): void {
  const s = store();
  try { s.musicSrc?.stop(); } catch { /* already stopped */ }
  s.musicSrc = undefined;
}

// Browsers keep an AudioContext suspended until the page gets a real user
// gesture. Bind a one-time unlock to the very first pointer/key gesture
// (the boot LAUNCH click on the home page) so samples work right away.
function unlock(): void {
  try {
    const c = ctx();
    if (c.state === 'suspended') c.resume().catch(() => {});
    startMusic();
  } catch { /* audio unavailable */ }
}

function bindGlobal(): void {
  const s = store();
  if (!s.unlockBound) {
    s.unlockBound = true;
    window.addEventListener('pointerdown', unlock, { once: true, capture: true });
    window.addEventListener('keydown', unlock, { once: true, capture: true });
    // Try to start music immediately (allowed once the browser trusts the
    // origin); otherwise it starts on the unlock gesture above.
    startMusic();
  }
  if (!s.clickBound) {
    s.clickBound = true;
    window.addEventListener(
      'click',
      (e) => {
        const t = e.target as Element | null;
        const hit = t?.closest?.('a, button');
        if (hit && !hit.closest('[data-sfx-silent]')) sfx('click');
      },
      { capture: true },
    );
    // Prefetch the small, hot samples so the first hover/click isn't late.
    if (s.on) {
      (['hover', 'click', 'open', 'deny'] as const).forEach((n) => {
        loadBuffer(SFX[n].url).catch(() => {});
      });
    }
  }
}

if (typeof window !== 'undefined') bindGlobal();

export function soundOn(): boolean {
  return store().on;
}

export function setSound(on: boolean): void {
  store().on = on;
  try { sessionStorage.setItem('rm-sound', on ? 'on' : 'off'); } catch { /* private mode */ }
  if (on) {
    blip(880, 0.05); // confirm blip on enable
    startMusic();
  } else {
    stopMusic();
  }
}

function play(ctx2: AudioContext, freq: number, gain: number): void {
  const osc = ctx2.createOscillator();
  const g = ctx2.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  g.gain.setValueAtTime(gain, ctx2.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx2.currentTime + 0.08);
  osc.connect(g);
  g.connect(ctx2.destination);
  osc.start();
  osc.stop(ctx2.currentTime + 0.09);
}

export function blip(freq: number, gain: number): void {
  try {
    const c = ctx();
    if (c.state === 'suspended') {
      c.resume().then(() => play(c, freq, gain)).catch(() => {});
      return;
    }
    play(c, freq, gain);
  } catch { /* audio unavailable */ }
}
```

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: exit 0, 13 pages built, no TypeScript errors.

- [ ] **Step 3: Browser smoke check**

Run `npm run dev`, open `http://localhost:4321/`, click LAUNCH, then in DevTools console:
- `window.__rmSound.musicSrc` is an `AudioBufferSourceNode` (music playing).
- Network tab shows `mainLoop.ogg` fetched once.
- Click any nav link target (e.g. the RM. logo): `buttonpress1.ogg` appears in Network; no console errors.
- Toggle SOUND·OFF: `window.__rmSound.musicSrc` becomes `undefined`; `sessionStorage.getItem('rm-sound')` is `'off'`. Reload: toggle still shows OFF and no music starts.

- [ ] **Step 4: Commit**

```bash
git add src/scripts/sound.ts
git commit -m "feat(sound): sample playback engine + ambient music loop + global click sfx"
```

---

### Task 2: Hover sound — CustomCursor and Timeline

**Files:**
- Modify: `src/components/home/islands/CustomCursor.tsx:2,25-34`
- Modify: `src/components/home/Timeline.astro:35-45`

**Interfaces:**
- Consumes: `sfx('hover')` from Task 1.
- Produces: nothing new.

- [ ] **Step 1: In `CustomCursor.tsx`, replace the import (line 2) and the `onOver` handler**

Import becomes:

```ts
import { sfx } from '../../../scripts/sound';
```

Replace the `onOver` block (lines 23–34 region) so the sample only fires when the hot element actually changes (mouseover re-fires for child spans of the same button; the old sine blip tolerated that, a sample doesn't):

```ts
    let mx = -100, my = -100, rx = -100, ry = -100, raf = 0;
    let prevHot: Element | null = null;
    const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
    const onOver = (e: MouseEvent) => {
      const target = e.target as Element;
      const hot = target.closest?.('a, button') ?? null;
      const ring = ringRef.current;
      if (ring) {
        ring.style.width = hot ? '52px' : '30px';
        ring.style.height = hot ? '52px' : '30px';
      }
      if (hot && hot !== prevHot) sfx('hover');
      prevHot = hot;
    };
```

(`soundOn` import is dropped — `sfx` self-gates.)

- [ ] **Step 2: In `Timeline.astro`, replace the script body (lines 35–45)**

```astro
<script>
  import { sfx } from '../../scripts/sound';

  // Rows are divs, not links, so the cursor's a/button hover sound doesn't
  // cover them — give them the same hover sample.
  document.querySelectorAll('#timeline [data-tl-row]').forEach((row) => {
    row.addEventListener('mouseenter', () => sfx('hover'));
  });
</script>
```

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: exit 0.

- [ ] **Step 4: Browser check**

`npm run dev`, home page, click LAUNCH (unlock), then hover a nav link: `hover.ogg` fetched once (Network), replays on each new link hovered, does NOT re-fire while moving within one button. Hover a timeline row: same sample. No console errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/home/islands/CustomCursor.tsx src/components/home/Timeline.astro
git commit -m "feat(sound): hover.ogg replaces sine blip on cursor + timeline rows"
```

---

### Task 3: Patent accordion open/deny sounds

**Files:**
- Modify: `src/components/home/islands/PatentAccordion.tsx:1-2,23-26,32-37`

**Interfaces:**
- Consumes: `sfx('open')`, `sfx('deny')` from Task 1; `[data-sfx-silent]` global-click exclusion from Task 1.
- Produces: nothing new.

- [ ] **Step 1: Replace the sound import (line 2)**

```ts
import { sfx } from '../../../scripts/sound';
```

- [ ] **Step 2: Replace `toggle` (lines 23–26)**

```ts
  const toggle = (i: number) => {
    sfx(open === i ? 'deny' : 'open');
    setOpen(open === i ? -1 : i);
  };
```

- [ ] **Step 3: Silence the global click sample on the accordion button**

Add `data-sfx-silent` to the `<button>` (line 32 region) so open/deny don't stack with `buttonpress1.ogg`:

```tsx
          <button
            type="button"
            data-sfx-silent
            onClick={() => toggle(i)}
            aria-expanded={open === i}
```

(rest of the button unchanged)

- [ ] **Step 4: Build + browser check**

Run: `npm run build` → exit 0.
Dev server: expand a patent → `open.ogg` fetched/played, collapse it → `deny.ogg`; only one sample per click (no simultaneous `buttonpress1.ogg`). No console errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/home/islands/PatentAccordion.tsx
git commit -m "feat(sound): accordion open/deny samples, silence generic click on it"
```

---

### Task 4: Boot overlay — replay on every home load + boot/launch sounds

**Files:**
- Modify: `src/components/home/BootOverlay.astro` (whole file below)

**Interfaces:**
- Consumes: `sfx('boot')`, `sfx('launch')` from Task 1; `[data-sfx-silent]` exclusion.
- Produces: nothing new. The LAUNCH click remains the first-gesture unlock that also starts music (Task 1's `unlock()`).

- [ ] **Step 1: Replace `src/components/home/BootOverlay.astro` with:**

```astro
{/* Terminal boot gate. Hidden by default (no-JS never blocks); the inline
    script shows it on every home-page load — refresh or navigation alike.
    The site unlocks when the user clicks LAUNCH — that click is also the
    user gesture that unlocks WebAudio and starts the music loop. */}
<div id="boot-overlay" class="fixed inset-0 z-[150] hidden items-center justify-center bg-surface-sunken transition-opacity duration-500">
  <div class="min-w-[340px] font-mono text-[14px] leading-[2.1] text-accent">
    <div class="boot-line" style="animation-delay: 0.1s">&gt; RM_OS v26.07 — initializing</div>
    <div class="boot-line text-ink/75" style="animation-delay: 0.55s">&gt; mounting /career ······· 25 YRS · OK</div>
    <div class="boot-line text-ink/75" style="animation-delay: 1s">&gt; loading platforms ····· $2.0T · OK</div>
    <div class="boot-line text-ink/75" style="animation-delay: 1.45s">&gt; verifying patents ······ [4/4] · OK</div>
    <div class="boot-line" style="animation-delay: 1.9s">&gt; render: ronmeck.dev<span class="ml-[6px] inline-block h-[15px] w-[9px] translate-y-[2px] animate-[rm-blink_0.9s_infinite] bg-accent"></span></div>
    <button id="boot-launch" type="button" data-sfx-silent class="boot-line mt-8 block border border-accent px-6 py-[14px] font-mono text-[13px] font-bold tracking-[0.12em] text-accent transition-colors hover:bg-accent hover:text-surface" style="animation-delay: 2.3s">LAUNCH APPLICATION →</button>
  </div>
</div>

<script is:inline>
  (() => {
    const el = document.getElementById('boot-overlay');
    const btn = document.getElementById('boot-launch');
    if (!el || !btn) return;
    el.style.display = 'flex';
    document.documentElement.style.overflow = 'hidden';
    btn.addEventListener('click', () => {
      document.documentElement.style.overflow = '';
      el.style.opacity = '0';
      setTimeout(() => { el.remove(); }, 550);
    });
  })();
</script>

<script>
  // Bundled (non-inline) so it can import the sound module. Runs a beat after
  // the inline gate — acceptable: the boot text animates for ~2.3s anyway.
  import { sfx } from '../../scripts/sound';
  const btn = document.getElementById('boot-launch');
  if (btn) {
    // On a truly first visit this is blocked by autoplay policy (no gesture
    // yet) and silently skipped — accepted in the spec.
    sfx('boot');
    btn.addEventListener('click', () => sfx('launch'));
  }
</script>
```

Changes vs. current file: `sessionStorage` gate removed (both the `rm-boot-played` read and write), `data-sfx-silent` added to the LAUNCH button, new bundled script for the two samples. Markup otherwise identical.

- [ ] **Step 2: Build + browser check**

Run: `npm run build` → exit 0.
Dev server:
- Load `/` → overlay shows. Click LAUNCH → `deephit-withglitch.ogg` plays (Network) and music starts.
- Refresh `/` → overlay shows again. Navigate to `/work/` and click the RM. logo back to `/` → overlay shows again.
- After the first LAUNCH click of the session, subsequent home loads also fetch/play `PixelAnimate.ogg` during the boot text (autoplay now granted); on the very first load it is silently skipped.
- Only the launch sample plays on LAUNCH click (no stacked `buttonpress1.ogg`).

- [ ] **Step 3: Commit**

```bash
git add src/components/home/BootOverlay.astro
git commit -m "feat(boot): replay overlay on every home load, add boot/launch samples"
```

---

### Task 5: EmailDecoder type sound

**Files:**
- Modify: `src/components/home/islands/EmailDecoder.tsx:1,27-29`

**Interfaces:**
- Consumes: `sfx('type')` from Task 1.
- Produces: nothing new.

- [ ] **Step 1: Add the import (line 1 region)**

```ts
import { useEffect, useRef } from 'react';
import { sfx } from '../../../scripts/sound';
```

- [ ] **Step 2: Play the sample when the scramble starts**

In the IntersectionObserver callback, after the reduced-motion early return (line 27) and before the animation kicks off:

```ts
        if (reduced) { el.textContent = target; return; }
        sfx('type');
        const t0 = performance.now();
```

Played once per page (observer disconnects after first trigger). Reduced-motion users get neither animation nor sound.

- [ ] **Step 3: Build + browser check**

Run: `npm run build` → exit 0.
Dev server: LAUNCH, scroll to the contact section → email scramble runs and `typearrayloop.ogg` plays once. No console errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/home/islands/EmailDecoder.tsx
git commit -m "feat(sound): type-array sample on email decode animation"
```

---

### Task 6: Cursor inversion via mix-blend-difference

**Files:**
- Modify: `src/components/home/islands/CustomCursor.tsx:63-64`

**Interfaces:**
- Consumes: nothing.
- Produces: nothing new. (Same technique the nav already uses: `Nav.astro`'s `[mix-blend-mode:difference]`.)

- [ ] **Step 1: Add `mix-blend-difference` to both cursor layers**

Replace the two divs in the return:

```tsx
      <div ref={dotRef} className="pointer-events-none fixed left-0 top-0 z-[200] h-[6px] w-[6px] rounded-full bg-accent mix-blend-difference" style={{ transform: 'translate(-100px, -100px)' }} />
      <div ref={ringRef} className="pointer-events-none fixed left-0 top-0 z-[200] h-[30px] w-[30px] rounded-full border border-accent opacity-60 mix-blend-difference [transition:width_0.2s,height_0.2s]" style={{ transform: 'translate(-100px, -100px)', width: '30px', height: '30px' }} />
```

Difference of accent `#F5A524` over itself is pure black; over the `#0A0A0B` surface it stays visually amber. Per-pixel, so partial overlap splits the cursor's color.

- [ ] **Step 2: Build + visual check**

Run: `npm run build` → exit 0.
Dev server (desktop pointer, no reduced-motion): move the cursor over a `.btn-solid` (e.g. the hero CTA) → dot and ring render black while over the amber fill, amber elsewhere; straddling the edge shows both at once. Hover the LAUNCH button until its `hover:bg-accent` fill kicks in → same inversion.

- [ ] **Step 3: Commit**

```bash
git add src/components/home/islands/CustomCursor.tsx
git commit -m "feat(cursor): invert to black over accent surfaces via mix-blend-difference"
```

---

### Task 7: Full verification pass

**Files:** none (verification only).

- [ ] **Step 1: Clean build**

Run: `npm run build`
Expected: exit 0, 13 pages, no warnings beyond the usual.

- [ ] **Step 2: Full browser walkthrough against the spec's Testing section**

`npm run preview` (serves the real Worker via wrangler dev):
- Boot overlay replays on refresh and nav-back-to-home; LAUNCH dismisses it, plays the deep-hit, starts music.
- Music loops (wait past the sample length — no gap/stop), sits under effects.
- SOUND·OFF: music stops, no samples fire anywhere, state survives navigation. SOUND·ON: confirm blip + music resumes.
- Hover (links, timeline rows), click, accordion open/close, email decode each play their mapped file exactly once per trigger.
- Cursor inverts over solid accent fills, splits at edges.
- Console shows zero errors across home, /work/, /patents/, /resume/ — including with sound OFF.

- [ ] **Step 3: Human listening pass**

The executor cannot judge levels/taste. Hand off to the user: do the gains (music 0.25, hover 0.35, click/open/deny 0.5, boot 0.6, launch 0.7) feel balanced? Adjust constants in `SFX`/`MUSIC_GAIN` in `src/scripts/sound.ts` per feedback.

- [ ] **Step 4: Commit any gain tweaks**

```bash
git add src/scripts/sound.ts
git commit -m "tweak(sound): balance sample gains per listening pass"
```
