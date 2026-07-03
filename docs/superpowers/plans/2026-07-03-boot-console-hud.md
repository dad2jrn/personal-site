# Boot Console HUD ("Field Station Mk II") Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the full-screen HUD console specified in `bootoverlay.md` (project root) — a self-assembling "Field Station" console with greebles, a streamed boot log, and a scramble-decoded `APPLICATION READY TO DEPLOY ▶` button that dismisses into the hero — as the boot experience for **tablet and desktop** visitors. **Phone-width visitors keep the current 5-line terminal `BootOverlay`, unchanged, for now.**

**Architecture:** A new React island (`BootConsole.tsx`, `client:load`) is added alongside (not instead of) the existing terminal overlay markup in `src/components/home/BootOverlay.astro`. Both self-gate at runtime on the same `(min-width: 768px)` check — the classic overlay's inline scripts only activate below that width; `BootConsole` only mounts its real content at or above it — so exactly one is ever live, never both. The new island is split into small focused files under `src/components/home/islands/boot/`: pure data/logic (no DOM) in `data.ts`/`scramble.ts`, a state-machine hook in `useBootTimeline.ts`, and presentational widgets grouped by how tightly they're coupled (`Greebles.tsx`, `SystemBox.tsx`, `Panels.tsx`, `Chrome.tsx`). `BootConsole.tsx` composes them into the header/rails/center/footer grid and owns sound + dismiss wiring for the desktop/tablet path only.

**Tech Stack:** Astro 7 + `@astrojs/react` (React 19) + Tailwind v4 (CSS-first `@theme`, arbitrary-value and arbitrary-breakpoint variants) + existing `src/scripts/sound.ts` WebAudio module. No test runner exists in this repo.

## Global Constraints

- **No test runner in this repo** (no vitest/jest/Playwright-test config). Per task below, "tests" are either (a) a throwaway Node verification script for pure logic, run then deleted, or (b) manual visual verification: `npm run dev`, then a headless Playwright screenshot (Chromium is already cached at `~/Library/Caches/ms-playwright`; install the `playwright` npm package into a scratch directory outside the repo if it isn't already available — do not add it to this repo's `package.json`). This replaces the skill's default pytest-style TDD loop.
- **Reuse existing design tokens** — don't hardcode hex values. `bg-surface-sunken` = `#060607`, `text-ink` = `#EDEBE6`, `text-accent`/`bg-accent`/`border-accent` = `#F5A524` (all defined in `src/styles/global.css` `@theme`). `font-mono` already maps to `'JetBrains Mono Variable'`.
- **Sharp corners everywhere** (no `rounded-*` Tailwind utility) **except** the RM roundel, which is a circle (`rounded-full`).
- **Do not modify** the existing `rm-bootline`, `rm-pulse`, or `rm-blink` keyframes in `src/styles/global.css` — they're used elsewhere (hero AVAILABLE dot, patent accordion nodes, blink cursor). This spec's own "pulse" (opacity 1↔0.3, no scale) is a different animation — added as a new keyframe `rm-boot-pulse` instead of overloading `rm-pulse`.
- **Reuse the existing dismiss transition.** The spec's §6 says "fades/wipes out 0.5s... (Recommended: fade + scale to 1.02)" but this repo already has a CRT power-off collapse (`rm-boot-exit` keyframe + `.boot-overlay-exit` class in `src/styles/global.css`, ~0.65s) that was built and visually verified earlier this session. Reuse it verbatim for the boot console's dismiss — same "wipe out and unmount" requirement, already on-brand. Flag this substitution to the user during plan review.
- **Sound integration.** `src/scripts/sound.ts` exports `sfx(name)` and `startMusic(name)`. Current `BootOverlay.astro` calls `sfx('boot')` on mount and `sfx('launch')` + `startMusic('main')` on the launch click — the new island must do the same. Any element that manually calls `sfx(...)` on click must carry `data-sfx-silent`, or the global click-sfx listener (`src/scripts/sound.ts:169-179`) double-fires a generic `'click'` sound on top of it.
- **`client:load` per spec** ("it must paint before anything else"). Any per-mount random values (e.g. signal-tick heights/timings) must be generated inside `useEffect` or a lazy `useState(() => ...)` initializer — never at module scope or in the function body directly — so the server-rendered markup and the first client render match (no hydration mismatch).
- **Non-standard breakpoints.** The spec's responsive rules (drop rails <1100px, log+button only <700px) don't align with Tailwind's default scale. Use Tailwind v4 arbitrary breakpoint variants: `min-[1100px]:` and `max-[699px]:`.
- **Verify after every task** that touches `.astro`/`.tsx`: `npx astro check` must report the same error/warning count as before the task (58 hints, 0 errors, 0 warnings as of this plan).
- **Device gating.** Phone-width visitors (`< 768px`, matching the project's existing Tailwind `md:` breakpoint) keep the current 5-line terminal overlay verbatim — no changes to its markup, its two `<script>` blocks, or its behavior, beyond wrapping each in a runtime width check. Tablet/desktop visitors (`>= 768px`) get `BootConsole`. The check runs once, client-side, per component — not via CSS `display` toggling — so the inactive experience never mounts its scripts/timers/sound calls at all.
- **The sound system is out of scope.** `src/scripts/sound.ts` is not modified by this plan. `BootConsole` calls its existing exports (`sfx`, `startMusic`) the same way the classic overlay already does; nothing new is added to that module.

---

## File Structure

```
src/components/home/islands/boot/
  types.ts            — shared TS types (Phase, LogLine, NavItem, CareerItem, PatentChipData, MicroSelectSeed, ArrayChipData, SeqRowData)
  data.ts              — all static content (nav items, career data, patent numbers, log lines + timing, transmission feed, micro-select/seq seeds)
  scramble.ts          — scrambleDecode() pure-ish algorithm (no React/DOM dependency beyond setInterval)
  useBootTimeline.ts   — phase state machine: choreography timers, log streaming, live clock/connection counter, skip-on-any-input, sessionStorage once-per-session, prefers-reduced-motion, tab-hidden pause, dismiss
  Greebles.tsx         — CornerHandles, MicroSelectRow, ArrayChip, SyncWidget, NineDWidget, LockBox, StatusDots
  SystemBox.tsx        — RM roundel + orbit ring + signal ticks + live clock/connection readout
  Panels.tsx           — SeqRows, NavModules, CareerBars, PatentChips, TransmissionWindow
  Chrome.tsx           — HeaderBand, Footer
src/components/home/islands/BootConsole.tsx   — top-level composition + layout grid + sound + dismiss wiring
src/components/home/BootOverlay.astro          — trimmed to a thin wrapper mounting <BootConsole client:load />
src/styles/global.css                          — + rm-fillx, rm-slidex, rm-flicker, rm-scrolly, rm-fall, rm-rot, rm-stamp, rm-boot-pulse keyframes
```

---

### Task 1: Types, data, and the scramble-decode algorithm

**Files:**
- Create: `src/components/home/islands/boot/types.ts`
- Create: `src/components/home/islands/boot/data.ts`
- Create: `src/components/home/islands/boot/scramble.ts`

**Interfaces:**
- Produces: `Phase = 'assembling' | 'log' | 'ready'`; `LogLine { text: string; color?: 'accent' | 'dim' }`; `NavItem { label: string; href: string }`; `CareerItem { code: string; year: string; pct: number; delay: number }`; `PatentChipData { number: string; delay: number }`; `MicroSelectSeed { code: string; period: number }`; `ArrayChipData { tag: string; code: string }`; `SeqRowData { label: string; value: string; code: string }`. Constants: `NAV_ITEMS`, `CAREER_ITEMS`, `PATENT_CHIPS`, `ARRAY_CHIPS`, `TRANSMISSION_LINES`, `LOG_LINES`, `BUTTON_LABEL`, `SUBTITLE`, `MICRO_SELECT_SEED`, `SEQ_ROWS`, `CONNECTION_START`. Function: `scrambleDecode(target: string, onTick: (value: string) => void, onDone?: () => void): () => void`.

- [ ] **Step 1: Create `types.ts`**

```ts
export type Phase = 'assembling' | 'log' | 'ready';

export interface LogLine {
  text: string;
  color?: 'accent' | 'dim';
}

export interface NavItem {
  label: string;
  href: string;
}

export interface CareerItem {
  code: string;
  year: string;
  pct: number; // 0-100
  delay: number; // seconds, entrance stagger
}

export interface PatentChipData {
  number: string;
  delay: number; // seconds, entrance stagger
}

export interface MicroSelectSeed {
  code: string;
  period: number; // seconds, thumb sweep duration
}

export interface ArrayChipData {
  tag: string; // number badge, e.g. "71"
  code: string; // e.g. "112"
}

export interface SeqRowData {
  label: string;
  value: string;
  code: string;
}
```

- [ ] **Step 2: Create `data.ts`**

```ts
import type {
  NavItem,
  CareerItem,
  PatentChipData,
  MicroSelectSeed,
  ArrayChipData,
  SeqRowData,
  LogLine,
} from './types';

export const NAV_ITEMS: NavItem[] = [
  { label: 'WORK DECRYPT', href: '#work' },
  { label: 'PATENT REGISTRY', href: '#patents' },
  { label: 'FIELD NOTES', href: '#writing' },
  { label: 'RESUME EXTRACT', href: '#resume' },
];

export const CAREER_ITEMS: CareerItem[] = [
  { code: 'US_NAVY.SYS', year: '1997', pct: 30, delay: 0.8 },
  { code: 'US_ARMY.SYS', year: '2002', pct: 45, delay: 1.1 },
  { code: 'BOFA.DLL', year: '2008', pct: 65, delay: 1.4 },
  { code: 'CAPITAL_ONE.CORE', year: '2016', pct: 85, delay: 1.7 },
  { code: 'VDOT.GOV', year: '2024', pct: 100, delay: 2.0 },
];

export const PATENT_CHIPS: PatentChipData[] = [
  { number: '10,951,542', delay: 1.6 },
  { number: '11,157,269', delay: 1.8 },
  { number: '12,086,648', delay: 2.0 },
  { number: '12,141,004', delay: 2.2 },
];

export const ARRAY_CHIPS: ArrayChipData[] = [
  { tag: '71', code: '112' },
  { tag: '53', code: '3A2' },
  { tag: '97', code: 'JN1' },
  { tag: '22', code: '6YT' },
];

export const TRANSMISSION_LINES: string[] = [
  '0x4A2F  MOV  R3, [CAREER_PTR]',
  '0x4A31  CMP  R3, #0x1997',
  '0x4A35  JNE  0x4A5C',
  '0x4A39  LD   R4, PATENT_TBL[R1]',
  '0x4A3D  ADD  R4, #0x04',
  '0x4A41  STR  R4, [SYS_STATE]',
  '0x4A45  CALL DECRYPT_NODE',
  '0x4A49  RET',
];

export const LOG_LINES: (LogLine & { t: number })[] = [
  { t: 2100, text: '> SECURE TERMINAL :: FIELD-STATION' },
  { t: 2450, text: '> AUTHORIZATION CHECK ········· OK' },
  { t: 2800, text: '> mounting /career ······· 25 YRS' },
  { t: 3150, text: '> patents ········· [4/4] GRANTED', color: 'dim' },
  { t: 3600, text: '> WELCOME, OPERATOR', color: 'accent' },
];

export const BUTTON_LABEL = 'APPLICATION READY TO DEPLOY';
export const SUBTITLE = 'ENTERPRISE ARCHITECT · EST. 1997 · 0 FAILURES';

// First 2 are the header's stacked rows; remaining 4 are the left rail.
export const MICRO_SELECT_SEED: MicroSelectSeed[] = [
  { code: '09431', period: 2.7 },
  { code: '10287', period: 3.4 },
  { code: '88213', period: 4.1 },
  { code: '55902', period: 2.9 },
  { code: '31745', period: 3.8 },
  { code: '67120', period: 4.4 },
];

export const SEQ_ROWS: SeqRowData[] = [
  { label: 'SEQ', value: '88731', code: '3RZ' },
  { label: 'LBL', value: 'NAVIGATE', code: '9RA' },
  { label: 'SEQ', value: '88731', code: '2R4' },
];

export const CONNECTION_START = 887652;
```

- [ ] **Step 3: Create `scramble.ts`**

```ts
const SCRAMBLE_CHARS = '#$%&@*+=?!<>/0123456789ABCDEF';
const STEPS = 25;
const TICK_MS = 40;

/** Number of leading (non-space) characters considered "settled" at a given step. Exported for verification. */
export function settledCount(step: number, len: number): number {
  return Math.round((step / STEPS) * len);
}

/**
 * Scrambles `target` into place over ~1000ms (25 ticks of 40ms). Calls
 * `onTick` with the in-progress string each tick, `onDone` once settled.
 * Returns a cancel function.
 */
export function scrambleDecode(
  target: string,
  onTick: (value: string) => void,
  onDone?: () => void,
): () => void {
  let step = 0;
  const interval = setInterval(() => {
    step++;
    const settled = settledCount(step, target.length);
    let out = '';
    for (let i = 0; i < target.length; i++) {
      if (target[i] === ' ') {
        out += ' ';
        continue;
      }
      out += i < settled ? target[i] : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
    }
    onTick(out);
    if (step >= STEPS) {
      clearInterval(interval);
      onTick(target);
      onDone?.();
    }
  }, TICK_MS);
  return () => clearInterval(interval);
}
```

- [ ] **Step 4: Verify `settledCount` by hand**

Create a scratch file at the repo root (outside `src/`, not committed):

```bash
cat > ./.scratch-scramble-check.mjs <<'EOF'
const STEPS = 25;
const settledCount = (step, len) => Math.round((step / STEPS) * len);
const len = 'APPLICATION READY TO DEPLOY'.length; // 28
console.log('step 0:', settledCount(0, len));   // expect 0
console.log('step 13:', settledCount(13, len)); // expect ~15
console.log('step 25:', settledCount(25, len)); // expect 28 (fully settled)
EOF
node ./.scratch-scramble-check.mjs
rm ./.scratch-scramble-check.mjs
```

Expected output: `step 0: 0`, `step 13: 15`, `step 25: 28`. This confirms the settle curve reaches 0 at the start and the full length by the last tick — the two properties the spec's algorithm depends on.

- [ ] **Step 5: Type-check**

Run: `npx astro check`
Expected: same counts as baseline (0 errors, 0 warnings, 58 hints) — these are plain `.ts` files with no template usage yet, so nothing should change.

- [ ] **Step 6: Commit**

```bash
git add src/components/home/islands/boot/types.ts src/components/home/islands/boot/data.ts src/components/home/islands/boot/scramble.ts
git commit -m "feat(boot): add boot console data, types, and scramble-decode algorithm"
```

---

### Task 2: `useBootTimeline` state machine hook

**Files:**
- Create: `src/components/home/islands/boot/useBootTimeline.ts`

**Interfaces:**
- Consumes: `LOG_LINES`, `BUTTON_LABEL`, `SUBTITLE`, `CONNECTION_START` from `./data`; `scrambleDecode` from `./scramble`; `Phase`, `LogLine` from `./types`.
- Produces: `useBootTimeline(): BootTimelineState` where `BootTimelineState = { phase: Phase; reduced: boolean; logLines: LogLine[]; buttonVisible: boolean; buttonLabel: string; subtitleVisible: boolean; footerSuffix: boolean; clock: string; connection: number; dismissed: boolean; dismiss: () => void }`.

- [ ] **Step 1: Create the hook**

```ts
import { useEffect, useRef, useState } from 'react';
import { LOG_LINES, BUTTON_LABEL, SUBTITLE, CONNECTION_START } from './data';
import { scrambleDecode } from './scramble';
import type { Phase, LogLine } from './types';

const SESSION_KEY = 'rm-boot-seen';
const BUTTON_AT = 4200;
const SUBTITLE_AT = 5300;
const FOOTER_SUFFIX_AT = 5800;

function formatClock(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

export interface BootTimelineState {
  phase: Phase;
  reduced: boolean;
  logLines: LogLine[];
  buttonVisible: boolean;
  buttonLabel: string;
  subtitleVisible: boolean;
  footerSuffix: boolean;
  clock: string;
  connection: number;
  dismissed: boolean;
  dismiss: () => void;
}

export function useBootTimeline(): BootTimelineState {
  const [reduced] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const [repeat] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return sessionStorage.getItem(SESSION_KEY) === '1';
    } catch {
      return false;
    }
  });
  const skipAhead = reduced || repeat;

  const [phase, setPhase] = useState<Phase>(skipAhead ? 'ready' : 'assembling');
  const [logLines, setLogLines] = useState<LogLine[]>(
    skipAhead ? LOG_LINES.map(({ text, color }) => ({ text, color })) : [],
  );
  const [buttonVisible, setButtonVisible] = useState(skipAhead);
  const [buttonLabel, setButtonLabel] = useState(skipAhead ? BUTTON_LABEL : '');
  const [subtitleVisible, setSubtitleVisible] = useState(skipAhead);
  const [footerSuffix, setFooterSuffix] = useState(skipAhead);
  const [clock, setClock] = useState(() => formatClock(new Date()));
  const [connection, setConnection] = useState(CONNECTION_START);
  const [dismissed, setDismissed] = useState(false);

  const timeouts = useRef<number[]>([]);
  const scrambleStop = useRef<(() => void) | null>(null);

  const clearAllTimeouts = () => {
    timeouts.current.forEach((id) => clearTimeout(id));
    timeouts.current = [];
  };

  const jumpToReady = () => {
    clearAllTimeouts();
    scrambleStop.current?.();
    setPhase('ready');
    setLogLines(LOG_LINES.map(({ text, color }) => ({ text, color })));
    setButtonVisible(true);
    setButtonLabel(BUTTON_LABEL);
    setSubtitleVisible(true);
    setFooterSuffix(true);
  };

  // Boot choreography — skipped entirely for reduced motion / repeat views.
  useEffect(() => {
    if (skipAhead) return;
    LOG_LINES.forEach((line) => {
      const id = window.setTimeout(() => {
        setPhase('log');
        setLogLines((prev) => [...prev, { text: line.text, color: line.color }]);
      }, line.t);
      timeouts.current.push(id);
    });
    const buttonId = window.setTimeout(() => {
      setPhase('ready');
      setButtonVisible(true);
      scrambleStop.current = scrambleDecode(BUTTON_LABEL, setButtonLabel);
    }, BUTTON_AT);
    timeouts.current.push(buttonId);
    timeouts.current.push(window.setTimeout(() => setSubtitleVisible(true), SUBTITLE_AT));
    timeouts.current.push(window.setTimeout(() => setFooterSuffix(true), FOOTER_SUFFIX_AT));

    return () => {
      clearAllTimeouts();
      scrambleStop.current?.();
    };
    // Intentionally runs once: skipAhead is stable for the life of the component.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skipAhead]);

  // "PRESS ANY KEY TO SKIP" — any keypress or click before ready jumps straight there.
  useEffect(() => {
    if (phase === 'ready') return;
    window.addEventListener('keydown', jumpToReady);
    window.addEventListener('click', jumpToReady);
    return () => {
      window.removeEventListener('keydown', jumpToReady);
      window.removeEventListener('click', jumpToReady);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Live clock + connection counter, paused while the tab is hidden.
  useEffect(() => {
    if (reduced) return;
    let interval: number | null = null;
    const start = () => {
      interval = window.setInterval(() => {
        setClock(formatClock(new Date()));
        setConnection((c) => c + Math.floor(Math.random() * 41));
      }, 1000);
    };
    const stop = () => {
      if (interval !== null) {
        clearInterval(interval);
        interval = null;
      }
    };
    const onVisibility = () => (document.hidden ? stop() : start());
    start();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [reduced]);

  const dismiss = () => {
    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      /* private mode */
    }
    setDismissed(true);
  };

  return {
    phase,
    reduced,
    logLines,
    buttonVisible,
    buttonLabel,
    subtitleVisible,
    footerSuffix,
    clock,
    connection,
    dismissed,
    dismiss,
  };
}
```

- [ ] **Step 2: Type-check**

Run: `npx astro check`
Expected: 0 errors (this file has no JSX, pure hook logic — `react-hooks/exhaustive-deps` is an ESLint rule, not part of `astro check`, so the inline comments are documentation for future readers, not suppressing a real check here).

- [ ] **Step 3: Commit**

```bash
git add src/components/home/islands/boot/useBootTimeline.ts
git commit -m "feat(boot): add boot console phase/timer state machine"
```

---

### Task 3: Greebles — small shared widgets

**Files:**
- Create: `src/components/home/islands/boot/Greebles.tsx`

**Interfaces:**
- Produces: `CornerHandles()`; `MicroSelectRow({ code, period, reduced }: { code: string; period: number; reduced: boolean })`; `ArrayChip({ tag, code }: { tag: string; code: string })`; `SyncWidget({ reduced }: { reduced: boolean })`; `NineDWidget({ reduced }: { reduced: boolean })`; `LockBox({ code }: { code: string })`; `StatusDots({ reduced }: { reduced: boolean })`.

- [ ] **Step 1: Create the file**

```tsx
export function CornerHandles() {
  return (
    <>
      <span aria-hidden="true" className="pointer-events-none absolute -left-[3px] -top-[3px] h-[5px] w-[5px] bg-ink" />
      <span aria-hidden="true" className="pointer-events-none absolute -right-[3px] -top-[3px] h-[5px] w-[5px] bg-ink" />
      <span aria-hidden="true" className="pointer-events-none absolute -bottom-[3px] -left-[3px] h-[5px] w-[5px] bg-ink" />
      <span aria-hidden="true" className="pointer-events-none absolute -bottom-[3px] -right-[3px] h-[5px] w-[5px] bg-ink" />
    </>
  );
}

export function MicroSelectRow({ code, period, reduced }: { code: string; period: number; reduced: boolean }) {
  return (
    <div aria-hidden="true" className="flex items-center gap-[6px] font-mono text-[8px] tracking-[0.12em] text-ink/40">
      <span className="h-[5px] w-[5px] border border-ink/40" />
      <span>{code}</span>
      <span className="text-accent">&#9660;</span>
      <span className="relative h-px w-[34px] bg-ink/[0.14]">
        <span
          className="absolute -top-[2px] left-0 h-[5px] w-[5px] bg-accent"
          style={reduced ? { transform: 'translateX(13px)' } : { animation: `rm-slidex ${period}s ease-in-out infinite alternate` }}
        />
      </span>
      <span>0</span>
    </div>
  );
}

export function ArrayChip({ tag, code }: { tag: string; code: string }) {
  return (
    <div aria-hidden="true" className="relative flex items-center gap-2 border border-ink/20 px-2 py-[6px]">
      <span className="absolute -left-1 -top-1 bg-accent px-[3px] font-mono text-[7px] font-bold text-surface">{tag}</span>
      <span className="flex h-4 w-4 items-center justify-center border border-ink/30 text-[9px] text-accent">&#9664;</span>
      <span className="font-mono text-[9px] tracking-[0.1em] text-ink/60">
        ARRAY <span className="text-accent/80">{code}</span>
      </span>
    </div>
  );
}

export function SyncWidget({ reduced }: { reduced: boolean }) {
  const periods = [1.8, 2.6, 2.2];
  return (
    <div aria-hidden="true" className="relative border border-ink/20 p-3">
      <CornerHandles />
      <div className="mb-2 font-mono text-[8px] tracking-[0.1em] text-accent">//SYNC</div>
      <div className="flex h-[54px] items-start justify-between gap-4 px-2">
        {periods.map((p, i) => (
          <div
            key={i}
            className="relative h-full w-px"
            style={{ background: 'repeating-linear-gradient(rgba(237,235,230,0.25) 0 3px, transparent 3px 6px)' }}
          >
            <span
              className="absolute left-1/2 top-0 h-[3px] w-[3px] -translate-x-1/2 rounded-full bg-accent"
              style={reduced ? undefined : { animation: `rm-fall ${p}s linear infinite` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 font-mono text-[8px] tracking-[0.08em] text-ink/40">DRIVE 6YT &middot; 998A</div>
    </div>
  );
}

export function NineDWidget({ reduced }: { reduced: boolean }) {
  return (
    <div aria-hidden="true" className="border border-ink/20 p-3">
      <div className="flex items-center justify-between font-mono text-[8px] tracking-[0.1em] text-ink/50">
        <span>9D</span>
        <span className="text-accent">&#9660;</span>
      </div>
      <div className="mt-1 font-mono text-[13px] text-ink/80">//A 44542</div>
      <div className="mt-2 flex gap-[6px]">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1 w-1 bg-accent"
            style={reduced ? { opacity: 1 } : { animation: `rm-boot-pulse 1.2s infinite ${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
}

export function LockBox({ code }: { code: string }) {
  return (
    <div aria-hidden="true" className="relative flex items-center justify-between border border-ink/20 px-3 py-2 font-mono text-[8px] tracking-[0.1em]">
      <CornerHandles />
      <span className="text-accent">// LOCK</span>
      <span className="text-ink/60">
        {code} <span className="text-accent">&#9660;</span>
      </span>
    </div>
  );
}

export function StatusDots({ reduced }: { reduced: boolean }) {
  return (
    <div aria-hidden="true" className="flex items-center gap-[6px]">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={i === 1 ? 'h-[6px] w-[6px] rounded-full bg-accent' : 'h-[6px] w-[6px] rounded-full bg-ink/30'}
          style={i === 1 && !reduced ? { animation: 'rm-boot-pulse 2s infinite' } : undefined}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx astro check`
Expected: 0 new errors. (This file isn't imported anywhere yet, so `astro check` should be silent on it beyond standard TSX linting — if it reports unused-export warnings, that's expected until Task 7 wires it up.)

- [ ] **Step 3: Commit**

```bash
git add src/components/home/islands/boot/Greebles.tsx
git commit -m "feat(boot): add boot console greeble widgets"
```

---

### Task 4: SystemBox

**Files:**
- Create: `src/components/home/islands/boot/SystemBox.tsx`

**Interfaces:**
- Consumes: `CornerHandles` from `./Greebles`.
- Produces: `SystemBox({ connection, clock, reduced }: { connection: number; clock: string; reduced: boolean })`.

- [ ] **Step 1: Create the file**

```tsx
import { useState } from 'react';
import { CornerHandles } from './Greebles';

interface Tick {
  h: number;
  dur: number;
  delay: number;
}

export function SystemBox({ connection, clock, reduced }: { connection: number; clock: string; reduced: boolean }) {
  // Generated once, client-side only (useState lazy initializer) — avoids
  // SSR/CSR hydration mismatches from Math.random() at module/render scope.
  const [ticks] = useState<Tick[]>(() =>
    Array.from({ length: 38 }, () => ({
      h: 6 + Math.round(Math.random() * 16),
      dur: 0.4 + Math.random() * 1.2,
      delay: Math.random() * 1.6,
    })),
  );

  return (
    <div className="relative border border-ink/20 p-6">
      <CornerHandles />
      <div className="flex flex-wrap items-center gap-6">
        <div className="relative flex h-[54px] w-[54px] shrink-0 items-center justify-center">
          {!reduced && (
            <span
              aria-hidden="true"
              className="absolute inset-[-6px] rounded-full border border-dashed border-accent/60"
              style={{ animation: 'rm-rot 14s linear infinite' }}
            />
          )}
          <span className="flex h-full w-full items-center justify-center rounded-full border border-accent font-mono text-[15px] font-black text-accent">
            RM
          </span>
        </div>
        <div className="min-w-[140px] flex-1">
          <div className="font-mono text-[11px] tracking-[0.12em] text-ink/80">
            SYSTEM &middot; <span className="text-accent">ACTIVE</span>
          </div>
          <div className="mt-1 font-mono text-[10px] tracking-[0.1em] text-ink/45">
            CONNECTION {connection.toLocaleString()}
          </div>
        </div>
        <div className="flex h-[22px] items-end gap-[2px]" aria-hidden="true">
          {ticks.map((t, i) => (
            <span
              key={i}
              className="w-[3px] bg-accent/70"
              style={{
                height: `${t.h}px`,
                opacity: reduced ? 0.6 : undefined,
                animation: reduced ? undefined : `rm-flicker ${t.dur}s steps(2) infinite ${t.delay}s`,
              }}
            />
          ))}
        </div>
        <div className="text-right">
          <div className="font-mono text-[9px] tracking-[0.1em] text-ink/40">SERVER TIME</div>
          <div className="font-mono text-[15px] text-accent">{clock}</div>
          <div className="mt-1 font-mono text-[9px] tracking-[0.1em] text-ink/40">ENCRYPT &middot; 981</div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx astro check`
Expected: 0 new errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/home/islands/boot/SystemBox.tsx
git commit -m "feat(boot): add boot console SystemBox widget"
```

---

### Task 5: Panels — SeqRows, NavModules, CareerBars, PatentChips, TransmissionWindow

**Files:**
- Create: `src/components/home/islands/boot/Panels.tsx`

**Interfaces:**
- Consumes: `CornerHandles` from `./Greebles`; `SEQ_ROWS`, `TRANSMISSION_LINES` from `./data`; `CareerItem`, `PatentChipData`, `NavItem` from `./types`.
- Produces: `SeqRows({ reduced }: { reduced: boolean })`; `NavModules({ items }: { items: NavItem[] })`; `CareerBars({ items, reduced }: { items: CareerItem[]; reduced: boolean })`; `PatentChips({ items }: { items: PatentChipData[] })`; `TransmissionWindow({ reduced }: { reduced: boolean })`.

- [ ] **Step 1: Create the file**

```tsx
import { CornerHandles } from './Greebles';
import { SEQ_ROWS, TRANSMISSION_LINES } from './data';
import type { CareerItem, PatentChipData, NavItem } from './types';

export function SeqRows({ reduced }: { reduced: boolean }) {
  return (
    <div className="flex flex-col gap-3">
      {SEQ_ROWS.map((row, i) => (
        <div key={i} aria-hidden="true" className="flex items-center gap-3 font-mono text-[10px] tracking-[0.1em]">
          <span className="w-[30px] text-ink/40">{row.label}</span>
          <span className="flex-1 border border-ink/20 px-2 py-1 text-ink/70">
            {row.value} <span className="text-accent">&#9660;</span> <span className="text-accent/80">{row.code}</span>
          </span>
          <span className="relative h-[3px] w-[46px] bg-ink/[0.14]">
            <span
              className="absolute -top-[4.5px] left-0 h-3 w-3 bg-accent"
              style={
                reduced
                  ? { transform: 'translateX(34px)' }
                  : { animation: `rm-slidex ${2.7 + i * 0.4}s ease-in-out infinite alternate` }
              }
            />
          </span>
        </div>
      ))}
    </div>
  );
}

export function NavModules({ items }: { items: NavItem[] }) {
  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <a
          key={item.href}
          href={item.href}
          data-nav-module
          data-sfx-silent
          className="group flex items-center gap-3 border border-accent/25 bg-accent/[0.09] px-4 py-3 no-underline transition-colors hover:border-accent hover:bg-accent/20"
        >
          <span className="flex gap-[2px]" aria-hidden="true">
            <span className="h-[14px] w-[3px] bg-accent" />
            <span className="h-[14px] w-[3px] bg-accent" />
            <span className="h-[14px] w-[3px] bg-accent" />
          </span>
          <span className="font-mono text-[12px] tracking-[0.16em] text-ink">{item.label}</span>
          <span className="ml-auto text-accent">&#9654;</span>
        </a>
      ))}
    </div>
  );
}

export function CareerBars({ items, reduced }: { items: CareerItem[]; reduced: boolean }) {
  return (
    <div>
      <div className="mb-3 font-mono text-[9px] tracking-[0.12em] text-ink/45">LOADING /CAREER</div>
      <div className="flex flex-col gap-3">
        {items.map((c) => (
          <div key={c.code} aria-hidden="true">
            <div className="mb-1 flex justify-between font-mono text-[9px] tracking-[0.08em] text-ink/50">
              <span>{c.code}</span>
              <span>{c.year}</span>
            </div>
            <div className="h-[3px] w-full bg-ink/[0.12]">
              <div
                className="h-full origin-left bg-accent"
                style={{
                  width: `${c.pct}%`,
                  ...(reduced ? {} : { animation: `rm-fillx 0.9s cubic-bezier(0.16,1,0.3,1) ${c.delay}s both` }),
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PatentChips({ items }: { items: PatentChipData[] }) {
  return (
    <div>
      <div className="mb-3 font-mono text-[9px] tracking-[0.12em] text-ink/45">PATENT REGISTRY &middot; USPTO</div>
      <div className="grid grid-cols-2 gap-2">
        {items.map((p) => (
          <div key={p.number} aria-hidden="true" className="border border-accent/25 px-2 py-2 text-center">
            <div className="font-mono text-[9px] text-accent">{p.number}</div>
            <div className="mt-1 font-mono text-[8px] tracking-[0.1em] text-ink/40">GRANTED</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TransmissionWindow({ reduced }: { reduced: boolean }) {
  const lines = [...TRANSMISSION_LINES, ...TRANSMISSION_LINES];
  return (
    <div aria-hidden="true" className="relative overflow-hidden border border-ink/20 p-3">
      <CornerHandles />
      <div className="mb-2 font-mono text-[8px] tracking-[0.1em] text-ink/40">RM TRANSMISSION &middot; RAW</div>
      <div className="relative h-[120px] overflow-hidden">
        <div
          className="absolute inset-x-0 top-0 flex flex-col gap-[3px]"
          style={reduced ? undefined : { animation: 'rm-scrolly 9s linear infinite' }}
        >
          {lines.map((l, i) => (
            <div key={i} className="font-mono text-[8.5px] text-accent/45">
              {l}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx astro check`
Expected: 0 new errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/home/islands/boot/Panels.tsx
git commit -m "feat(boot): add boot console SEQ/NAV/career/patent/transmission panels"
```

---

### Task 6: Chrome (HeaderBand, Footer) + new keyframes

**Files:**
- Create: `src/components/home/islands/boot/Chrome.tsx`
- Modify: `src/styles/global.css` (add keyframes near the existing `rm-*` block, around line 62-67)

**Interfaces:**
- Consumes: `MicroSelectRow`, `StatusDots` from `./Greebles`; `MICRO_SELECT_SEED` from `./data`.
- Produces: `HeaderBand({ reduced, showSkipHint }: { reduced: boolean; showSkipHint: boolean })`; `Footer({ reduced, suffix }: { reduced: boolean; suffix: boolean })`.

- [ ] **Step 1: Add keyframes to `global.css`**

In `src/styles/global.css`, immediately after the existing `@keyframes rm-fadeup { ... }` line, add:

```css
@keyframes rm-fillx   { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes rm-slidex  { from { transform: translateX(0); } to { transform: translateX(26px); } }
@keyframes rm-flicker { 0%, 100% { opacity: 0.15; } 50% { opacity: 0.9; } }
@keyframes rm-scrolly { from { transform: translateY(0); } to { transform: translateY(-50%); } }
@keyframes rm-fall    { 0% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(54px); opacity: 0; } }
@keyframes rm-rot     { to { transform: rotate(360deg); } }
@keyframes rm-stamp   { 0% { opacity: 0; transform: scale(2.2); } 60% { opacity: 1; transform: scale(0.96); } 100% { opacity: 1; transform: scale(1); } }
@keyframes rm-boot-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
```

- [ ] **Step 2: Create `Chrome.tsx`**

```tsx
import { MicroSelectRow, StatusDots } from './Greebles';
import { MICRO_SELECT_SEED } from './data';

export function HeaderBand({ reduced, showSkipHint }: { reduced: boolean; showSkipHint: boolean }) {
  const [a, b] = MICRO_SELECT_SEED;
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 font-mono text-[13px] tracking-[0.18em] text-ink/85">
          <span className="text-accent">&#9660;</span>
          <span>
            RM SERVER ACCESS | <span className="text-accent">OPERATOR CONSOLE</span>
          </span>
        </div>
        <div className="relative mt-3 h-px w-[480px] max-w-full bg-ink/[0.14]">
          <span className="absolute -left-[2px] -top-[2px] h-[5px] w-[5px] bg-ink" />
          <span className="absolute -right-[2px] -top-[2px] h-[5px] w-[5px] bg-ink" />
        </div>
      </div>
      <div className="hidden flex-col items-end gap-2 min-[1100px]:flex">
        <MicroSelectRow code={a.code} period={a.period} reduced={reduced} />
        <MicroSelectRow code={b.code} period={b.period} reduced={reduced} />
        {showSkipHint && (
          <div className="mt-1 font-mono text-[8px] tracking-[0.1em] text-ink/30">PRESS ANY KEY TO SKIP</div>
        )}
      </div>
    </div>
  );
}

export function Footer({ reduced, suffix }: { reduced: boolean; suffix: boolean }) {
  return (
    <div className="border-t border-ink/[0.14] pt-4">
      <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] tracking-[0.1em] text-ink/45">
        <div className="flex items-center gap-3">
          <StatusDots reduced={reduced} />
          <span>TTY/0 :: RM FIELD-STATION</span>
        </div>
        <div>
          <span className="text-accent">SESSION RM97-2607</span>
          {suffix && <span> &middot; STANDING BY</span>}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Type-check**

Run: `npx astro check`
Expected: 0 new errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/home/islands/boot/Chrome.tsx src/styles/global.css
git commit -m "feat(boot): add boot console header/footer chrome and remaining keyframes"
```

---

### Task 7: `BootConsole.tsx` — top-level composition

**Files:**
- Create: `src/components/home/islands/BootConsole.tsx`

**Interfaces:**
- Consumes: everything produced in Tasks 1-6, plus `sfx`, `startMusic` from `../../../scripts/sound`.
- Produces: `export function BootConsoleInner(): JSX.Element` (the full HUD, no device check of its own) and `export default function BootConsole(): JSX.Element | null` (the device-gated wrapper `client:load` actually mounts — renders `null` until a client-side check confirms `>= 768px`, then renders `BootConsoleInner`).

- [ ] **Step 1: Create the file**

```tsx
import { useEffect, useRef, useState } from 'react';
import { useBootTimeline } from './boot/useBootTimeline';
import { HeaderBand, Footer } from './boot/Chrome';
import { MicroSelectRow, ArrayChip, SyncWidget, NineDWidget, LockBox } from './boot/Greebles';
import { SystemBox } from './boot/SystemBox';
import { SeqRows, NavModules, CareerBars, PatentChips, TransmissionWindow } from './boot/Panels';
import { MICRO_SELECT_SEED, ARRAY_CHIPS, CAREER_ITEMS, PATENT_CHIPS, NAV_ITEMS, SUBTITLE } from './boot/data';
import { sfx, startMusic } from '../../scripts/sound';

// Entrance delays (seconds) — every element uses rm-bootline 0.3s both {delay};
// these are the delays from bootoverlay.md §5, condensed to per-region values.
const ENTRANCE = {
  header: 0.1,
  leftRail: 0.5,
  system: 0.5,
  seq: 0.9,
  nav: 1.4,
  career: 0.6,
  patents: 0.9,
  sync: 1.4,
  locks: 1.5,
  transmission: 1.2,
  footer: 0.8,
} as const;

// Tablet/desktop only — matches the project's existing Tailwind `md:` breakpoint.
// Phone-width visitors keep the classic terminal overlay (see BootOverlay.astro).
const DESKTOP_QUERY = '(min-width: 768px)';

export default function BootConsole() {
  // Starts `false` so server render and first client paint agree (no
  // hydration mismatch) — flips to `true` a tick after mount if this is a
  // tablet/desktop viewport. All of BootConsoleInner's timers/sound/effects
  // stay unmounted until then, so phone visitors never run any of this.
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    setEnabled(window.matchMedia(DESKTOP_QUERY).matches);
  }, []);
  if (!enabled) return null;
  return <BootConsoleInner />;
}

export function BootConsoleInner() {
  const t = useBootTimeline();
  const rootRef = useRef<HTMLDivElement>(null);
  const bootedRef = useRef(false);

  useEffect(() => {
    if (!bootedRef.current) {
      sfx('boot');
      bootedRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (!t.dismissed) return;
    const root = rootRef.current;
    if (!root) return;
    const onEnd = () => root.remove();
    root.addEventListener('animationend', onEnd, { once: true });
    root.classList.add('boot-overlay-exit');
    return () => root.removeEventListener('animationend', onEnd);
  }, [t.dismissed]);

  const enter = (key: keyof typeof ENTRANCE) => (t.reduced ? undefined : { animation: `rm-bootline 0.3s both ${ENTRANCE[key]}s` });

  const handleLaunch = () => {
    sfx('launch');
    startMusic('main');
    t.dismiss();
  };

  const handleRootClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const anchor = (e.target as HTMLElement).closest('a[data-nav-module]') as HTMLAnchorElement | null;
    if (!anchor) return;
    e.preventDefault();
    const href = anchor.getAttribute('href');
    sfx('launch');
    startMusic('main');
    t.dismiss();
    if (href) {
      window.setTimeout(() => {
        document.querySelector(href)?.scrollIntoView({ behavior: 'auto', block: 'start' });
      }, 0);
    }
  };

  return (
    <div
      ref={rootRef}
      role="status"
      aria-label="Site loading"
      data-sfx-silent
      onClick={handleRootClick}
      className="fixed inset-0 z-[150] overflow-hidden bg-surface-sunken text-ink"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: 'radial-gradient(rgba(237,235,230,0.06) 1px, transparent 1px)', backgroundSize: '26px 26px' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          backgroundImage:
            'repeating-linear-gradient(rgba(237,235,230,0.02) 0px, rgba(237,235,230,0.02) 1px, transparent 1px, transparent 3px)',
        }}
      />

      <div className="relative z-20 flex h-full flex-col justify-between gap-6 p-6 md:p-10">
        <div style={enter('header')}>
          <HeaderBand reduced={t.reduced} showSkipHint={t.phase !== 'ready'} />
        </div>

        <div className="flex flex-1 items-center gap-10 overflow-hidden">
          <div className="hidden w-[148px] shrink-0 flex-col gap-3 min-[1100px]:flex" style={enter('leftRail')}>
            {MICRO_SELECT_SEED.slice(2).map((m) => (
              <MicroSelectRow key={m.code} code={m.code} period={m.period} reduced={t.reduced} />
            ))}
            <div className="mt-2 flex flex-col gap-2">
              {ARRAY_CHIPS.map((c) => (
                <ArrayChip key={c.code} tag={c.tag} code={c.code} />
              ))}
            </div>
            <div style={enter('sync')}>
              <SyncWidget reduced={t.reduced} />
            </div>
            <NineDWidget reduced={t.reduced} />
          </div>

          <div className="mx-auto flex w-full max-w-[660px] flex-1 flex-col gap-6 max-[699px]:mx-auto max-[699px]:max-w-[420px] max-[699px]:items-center max-[699px]:text-center">
            <div className="hidden min-[700px]:block" style={enter('system')}>
              <SystemBox connection={t.connection} clock={t.clock} reduced={t.reduced} />
            </div>
            <div className="hidden min-[700px]:block" style={enter('seq')}>
              <SeqRows reduced={t.reduced} />
            </div>
            <div className="hidden min-[700px]:block" style={enter('nav')}>
              <NavModules items={NAV_ITEMS} />
            </div>
            <div className="min-h-[140px] whitespace-pre font-mono text-[12px] leading-[1.95] text-ink/[0.78]">
              {t.logLines.map((line, i) => (
                <div key={i} className={line.color === 'accent' ? 'text-accent' : line.color === 'dim' ? 'text-ink/50' : ''}>
                  {line.text}
                </div>
              ))}
            </div>
            {t.buttonVisible && (
              <button
                type="button"
                autoFocus
                data-sfx-silent
                onClick={handleLaunch}
                className="inline-flex w-fit items-center gap-3 bg-accent px-8 py-[18px] font-mono text-[15px] font-bold tracking-[0.16em] text-surface shadow-[0_0_40px_rgba(245,165,36,0.25)] transition-[transform,box-shadow] duration-200 hover:-translate-y-[3px] hover:shadow-[0_8px_50px_rgba(245,165,36,0.4)]"
                style={t.reduced ? undefined : { animation: 'rm-stamp 0.35s both' }}
              >
                {t.buttonLabel}
                <span className="text-[13px]">&#9654;</span>
              </button>
            )}
            {t.subtitleVisible && <div className="font-mono text-[11px] tracking-[0.12em] text-ink/45">{SUBTITLE}</div>}
          </div>

          <div className="hidden w-[300px] shrink-0 flex-col gap-6 min-[1100px]:flex">
            <div className="font-mono text-[9px] tracking-[0.12em] text-ink/40">CARRIER WAVE</div>
            <div style={enter('career')}>
              <CareerBars items={CAREER_ITEMS} reduced={t.reduced} />
            </div>
            <div style={enter('patents')}>
              <PatentChips items={PATENT_CHIPS} />
            </div>
            <div style={enter('transmission')}>
              <TransmissionWindow reduced={t.reduced} />
            </div>
            <div className="flex flex-col gap-2" style={enter('locks')}>
              <LockBox code="998A" />
              <LockBox code="220A" />
            </div>
          </div>
        </div>

        <div className="hidden min-[700px]:block" style={enter('footer')}>
          <Footer reduced={t.reduced} suffix={t.footerSuffix} />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx astro check`
Expected: 0 new errors. This file isn't mounted anywhere yet (Task 8 does that), so it won't render, but it must compile clean.

- [ ] **Step 3: Commit**

```bash
git add src/components/home/islands/BootConsole.tsx
git commit -m "feat(boot): add BootConsole top-level composition"
```

---

### Task 8: Wire `BootConsole` alongside the classic overlay (device-gated) + full visual QA

**Files:**
- Modify: `src/components/home/BootOverlay.astro` (keep the existing terminal markup and both `<script>` blocks verbatim; gate each script's body behind a width check; add `<BootConsole client:load />`)

**Interfaces:**
- Consumes: `BootConsole` (default export) from `./islands/BootConsole`.

- [ ] **Step 1: Gate the classic overlay's two scripts and add `BootConsole`**

Read the current `src/components/home/BootOverlay.astro` first — do not retype its markup or the sound-related script from memory; wrap the *existing* script bodies in the width check shown below, keeping every other line (including the sound import and comments) unchanged. The `<div id="boot-overlay">` markup itself is untouched. Add the `BootConsole` import and mount at the end of the file:

```astro
<script is:inline>
  (() => {
    // Phone-width only — tablet/desktop gets <BootConsole> below instead.
    if (window.matchMedia('(min-width: 768px)').matches) return;
    const el = document.getElementById('boot-overlay');
    const btn = document.getElementById('boot-launch');
    if (!el || !btn) return;
    el.style.display = 'flex';
    document.documentElement.style.overflow = 'hidden';
    btn.addEventListener('click', () => {
      document.documentElement.style.overflow = '';
      el.addEventListener('animationend', () => { el.remove(); }, { once: true });
      el.classList.add('boot-overlay-exit');
    });
  })();
</script>

<script>
  // Phone-width only — see the guard at the top; unchanged otherwise.
  import { sfx, startMusic } from '../../scripts/sound';
  if (window.matchMedia('(min-width: 768px)').matches) {
    // no-op: tablet/desktop uses BootConsole's own sound wiring instead
  } else {
    const btn = document.getElementById('boot-launch');
    if (btn) {
      sfx('boot');
      btn.addEventListener('click', () => {
        sfx('launch');
        startMusic('main');
      });
    }
  }
</script>

<BootConsole client:load />
```

And add to the frontmatter:

```astro
---
import BootConsole from './islands/BootConsole';
---
```

- [ ] **Step 2: Type-check**

Run: `npx astro check`
Expected: 0 errors, same 58-hint baseline (nothing about the classic overlay's structure changed, only the guard clauses inside its scripts — plus the new `BootConsole` import/mount).

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: `13 page(s) built` (or however many pages currently exist), `Complete!`, no errors.

- [ ] **Step 4: Manual visual QA — start the dev server**

```bash
npm run dev &
until curl -sf http://localhost:4321 >/dev/null; do sleep 1; done
```

- [ ] **Step 5: Desktop pass (headless Playwright screenshot)**

If `playwright` isn't already available as a Node module outside the repo, install it in a scratch directory first (`npm init -y && npm install playwright && npx playwright install chromium`, run once, reused across screenshots). Then:

```js
// screenshot.mjs
import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
await page.goto('http://localhost:4321', { waitUntil: 'networkidle' });
await page.waitForTimeout(4300); // past BUTTON_AT (4200ms)
await page.screenshot({ path: 'boot-desktop-ready.png' });
await browser.close();
```

Run: `node screenshot.mjs`
Expected in `boot-desktop-ready.png`: full HUD — header band top-left, 2 micro-select rows top-right, left rail (micro-selects/array chips/sync/9D) and right rail (carrier wave/career bars/patent chips/transmission/locks) both visible at 1400px, SystemBox with RM roundel + orbit ring + clock, SEQ rows, 4 NAV modules, boot log with 5 lines (last one amber "WELCOME, OPERATOR"), amber payoff button reading "APPLICATION READY TO DEPLOY ▶", footer with status dots + session id.

- [ ] **Step 6: Responsive breakpoints**

Repeat Step 5's script at `viewport: { width: 1050, height: 900 }` (expect both rails hidden, header/center/footer remain) and `viewport: { width: 650, height: 900 }` (expect only the boot log + payoff button, centered — header/SystemBox/SeqRows/NavModules/Footer all hidden).

- [ ] **Step 7: Reduced motion**

Add `reducedMotion: 'reduce'` to the `newPage` call, reload, screenshot immediately (no wait needed — should render the ready state statically at t=0). Expected: button and full log visible immediately, no orbit ring, no flicker ticks, no sliding thumbs (all replaced by their static resting-state markup per each component's `reduced` branch).

- [ ] **Step 8: Skip-on-keypress**

Reload without `reducedMotion`, wait 500ms (still in `assembling` phase), then `await page.keyboard.press('Space')`, screenshot immediately after. Expected: full log + button visible well before the normal 4200ms mark — confirms the skip listener fired.

- [ ] **Step 9: Repeat-view (sessionStorage)**

In the same Playwright context (cookies/session storage persist per-context, not per-navigation), click the payoff button (`page.click('button:has-text("APPLICATION")')`), wait for the dismiss animation (~700ms), then `page.reload()`. Expected: on reload, the console mounts directly in the `ready` phase (button visible immediately, no ~4s wait) — confirms the `sessionStorage` flag round-trip.

- [ ] **Step 10: Click-to-launch and NAV-module skip-scroll**

On a fresh context, click a NAV module (e.g. "WORK DECRYPT") before the choreography finishes. Expected: overlay dismisses (same CRT-collapse as the button) and the page ends up scrolled to `#work`.

- [ ] **Step 11: Phone-width gets the classic overlay, not the HUD**

```js
// screenshot-phone.mjs
import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } }); // iPhone-class width, < 768px
await page.goto('http://localhost:4321', { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
await page.screenshot({ path: 'boot-phone.png' });
const consoleMounted = await page.evaluate(() => !!document.querySelector('[role="status"][aria-label="Site loading"]'));
const classicVisible = await page.evaluate(() => getComputedStyle(document.getElementById('boot-overlay')).display !== 'none');
console.log({ consoleMounted, classicVisible }); // expect { consoleMounted: false, classicVisible: true }
await browser.close();
```

Run: `node screenshot-phone.mjs`
Expected: `boot-phone.png` shows the classic 5-line terminal ("RM_OS v26.07 — initializing..."), and the logged object is `{ consoleMounted: false, classicVisible: true }` — confirms `BootConsole` never mounted below 768px and the classic overlay is the one actually running.

- [ ] **Step 12: Desktop/tablet gets the HUD, not the classic overlay**

Repeat Step 11's script with `viewport: { width: 900, height: 900 }` (tablet-class, >= 768px). Expected: the logged object is `{ consoleMounted: true, classicVisible: false }` — the classic `#boot-overlay` div stays `hidden` (its script's width guard returned early) while `BootConsole` rendered the HUD.

- [ ] **Step 13: No double `sfx('boot')` on either path**

In each of the Step 11 / Step 12 contexts, before navigating, inject a counter: `await page.addInitScript(() => { window.__bootSfxCalls = 0; const orig = console.log; /* placeholder hook point */ });` — simpler: open dev tools network/console and confirm only one `AudioContext` fetch of `/sounds/PixelAnimate.ogg` (the `boot` sfx) fires per load, via `page.on('request', r => { if (r.url().includes('PixelAnimate')) count++; })`, asserting `count === 1` on both the phone-width and desktop-width runs.

- [ ] **Step 14: Stop the dev server, clean up scratch files**

```bash
kill %1 2>/dev/null || pkill -f "astro dev"
rm -f screenshot.mjs screenshot-phone.mjs boot-desktop-ready.png boot-phone.png
```

- [ ] **Step 15: Commit**

```bash
git add src/components/home/BootOverlay.astro
git commit -m "feat(boot): add BootConsole HUD for tablet/desktop, keep classic overlay on phones"
```

---

## Self-Review Notes

- **Spec coverage:** §1 tokens → Global Constraints + Tailwind theme reuse. §2 layout → Task 7's grid + `min-[1100px]:`/`min-[700px]:` breakpoints. §3 widgets 1-12 → Tasks 3-6 (all 12 accounted for: micro-select, array chip, sync, 9D, system box, seq row, nav module, career bars, patent chips, transmission window, lock box, status dots). §4 keyframes → Task 6 Step 1 (rm-bootline/rm-pulse/rm-blink reused, others added; `rm-pulse` intentionally renamed `rm-boot-pulse` per Global Constraints). §5 choreography → `useBootTimeline` timers + `ENTRANCE` delays. §6 payoff button → Task 7 (with noted dismiss-animation substitution). §7 accessibility → skip listener, `aria-hidden` on greebles, `role="status"`, `autoFocus` button, tab-hidden pause, cleanup on unmount. §8 state → `BootTimelineState` shape matches almost exactly.
- **Placeholder scan:** no TBD/TODO; every step has complete code.
- **Type consistency:** `LogLine`/`NavItem`/`CareerItem`/`PatentChipData`/`MicroSelectSeed`/`ArrayChipData`/`SeqRowData` defined once in `types.ts` and used identically across `data.ts`, `Greebles.tsx`, `SystemBox.tsx`, `Panels.tsx`, `Chrome.tsx`, `BootConsole.tsx`. `BootTimelineState` fields match `useBootTimeline`'s return object and `BootConsoleInner`'s usage (`t.phase`, `t.reduced`, `t.logLines`, etc.) 1:1.
- **Device gating (added after user feedback):** the classic overlay in `BootOverlay.astro` is preserved byte-for-byte except for one early-return guard added to each of its two `<script>` bodies; `BootConsole`'s default export is a thin `useState`/`useEffect` gate around the real `BootConsoleInner`, so on phones neither `useBootTimeline`'s timers nor its `sfx('boot')` call ever run — only the classic overlay's existing script does. Task 8 Steps 11-13 verify both sides mount exclusively and that `sfx('boot')` fires exactly once regardless of viewport. `src/scripts/sound.ts` itself is untouched by every task in this plan.
