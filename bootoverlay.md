# Boot Overlay Spec — "Field Station Mk II"

Replaces the current 5-line boot overlay on ronmeck.dev with a full-screen HUD console that assembles itself, runs a boot log, and ends on an amber **APPLICATION READY TO DEPLOY ▶** button that dismisses into the hero.

**Design reference:** `Boot Overlay Variants.dc.html`, option `4a` (the `runH2()` method in the logic class is the complete behavioral spec — port the algorithms, don't ship the file).

**Target stack:** Astro v5 + React + Tailwind + TS. Implement as a single React island (`client:load` — it must paint before anything else), rendered above the page in a fixed overlay.

---

## 1. Tokens (same as site)

- Overlay background: `#060607`
- Text: `#EDEBE6`; body log `rgba(237,235,230,0.78)`; dim `rgba(237,235,230,0.45)`; micro-labels `rgba(237,235,230,0.4)`
- Accent: `#F5A524` (CRT amber) — the only accent
- Hairlines: `1px solid rgba(237,235,230,0.18–0.22)` (panel borders); `rgba(237,235,230,0.12–0.14)` for long rules
- Fonts: JetBrains Mono (all HUD text; micro 8–9px, labels 10–11px, log 12–13px), Archivo (only if a display-size element is added)
- Backgrounds on frame: dot grid `radial-gradient(rgba(237,235,230,0.06) 1px, transparent 1px)` at `26px 26px`, plus scanlines `repeating-linear-gradient(rgba(237,235,230,0.02) 0 1px, transparent 1px 3px)` overlaid (pointer-events none, above content, z-index high)
- Corner handles: `5×5px` solid `#EDEBE6` squares absolutely positioned at `-3px` on box corners
- Sharp corners everywhere (radius 0), except the RM roundel (circle)

## 2. Layout (desktop, fluid; prototype frame 1284×860)

Fixed overlay, `inset: 0`, `z-index` above nav. Content grid:

- **Header band** (top 20px, inset 40px): left — amber `▼` + `RM SERVER ACCESS | OPERATOR CONSOLE` (13px, tracking 0.18em, "OPERATOR CONSOLE" in amber); right — 2 stacked micro-select rows. A 480px hairline under the left title with 5px endpoint squares.
- **Left greeble rail** (width ~148px): 4 micro-select rows → 4 ARRAY chips → //SYNC widget → 9D///A widget. Vertical stack, 12px gaps.
- **Center column** (left ~236px, width ~660px): SYSTEM box → 3 SEQ rows → 4 NAV modules → boot log → payoff button.
- **Right rail** (width ~300px): CARRIER WAVE line → LOADING /CAREER bars → PATENT REGISTRY chips → scrolling transmission window → 2 LOCK boxes.
- **Footer** (bottom 20px, inset 40px): full-width hairline above; left — 3 status dots (middle amber, pulsing) + `TTY/0 :: RM FIELD-STATION`; right — `SESSION RM97-2607` (amber label) + ` · STANDING BY` appended late.

Responsive: below ~1100px drop both rails, keep header/center/footer. Below ~700px keep only log + payoff button, centered.

## 3. Widget inventory (all continuously animated)

1. **Micro-select row** — `□ 09431 ▼ ——●— 0` at 8px/tracking 0.12em. 5px outlined square, label, amber `▼` (7px), 34px hairline track with a 5px amber thumb sweeping `translateX(0→26px)` ease-in-out infinite alternate (period 2.7–4.4s, varied per row), trailing `0`.
2. **ARRAY chip** — 16px outlined square with amber `◀` + hairline box (padding 6px 8px) with an amber number tag (7px, amber bg, dark text) overlapping the top-left corner; content `ARRAY 112` (code in 80% amber). Data: 71/112, 53/3A2, 97/JN1, 22/6YT.
3. **//SYNC widget** — corner-handled hairline box. Three vertical dashed 1px lines (54px tall, `linear-gradient` dash trick) with 3px amber dots falling down them (`translateY(0→54px)` + fade, linear infinite, periods 1.8/2.6/2.2s, staggered). Caption `DRIVE 6YT · 998A`.
4. **9D //A widget** — hairline box: `9D ▼` header row, `//A 44542` value (13px), 3 pulsing 4px squares (rm-pulse 1.2s, staggered 0.2s).
5. **SYSTEM box** — corner handles; RM roundel (54px circle, 1px amber border, 900-weight "RM") with a **dashed amber orbit ring rotating 360° / 14s**; center: `SYSTEM · ACTIVE` + `CONNECTION {n}` where n starts 887652 and increments by 0–40 every second (live); 38 vertical signal ticks (3px wide, 6–22px tall) each flickering `opacity 0.15↔0.9` `steps(2)` at randomized 0.4–1.6s periods/delays; right: `SERVER TIME` + **live clock HH:MM:SS** (15px amber, 1s tick) + `ENCRYPT · 981`.
6. **SEQ row** — 30px dim label (`SEQ`/`LBL`/`SEQ`), hairline input box showing `88731 ▼ 3RZ` (value / amber caret / amber code), then a 46×3px track with a 12px amber thumb sweeping like the micro-selects. Codes: 3RZ, 9RA (val `NAVIGATE`), 2R4.
7. **NAV module** — `NAV` ghost label (9px, 30% ink) + full-width bar: `rgba(245,165,36,0.09)` bg, `rgba(245,165,36,0.25)` border, 3×14px amber tick + label (12px, tracking 0.16em) + amber `▶`. Hover: bg 0.2 alpha, border full amber. Labels: WORK DECRYPT / PATENT REGISTRY / FIELD NOTES / RESUME EXTRACT. On the live site these are real anchors (#work, #patents, #writing, #resume) — clicking skips the boot and scrolls there.
8. **Career bars** — panel `LOADING /CAREER`: 5 rows, 9px label + year right-aligned, 3px track, amber fill scaling `scaleX(0→1)` 0.9s `cubic-bezier(0.16,1,0.3,1)`. Data: US_NAVY.SYS/1997/30% · US_ARMY.SYS/2002/45% · BOFA.DLL/2008/65% · CAPITAL_ONE.CORE/2016/85% · VDOT.GOV/2024/100%. Fill delays 0.8–2.0s stagger.
9. **Patent chips** — panel `PATENT REGISTRY · USPTO`, 2×2 grid of amber-hairline chips: number (9px amber) over `GRANTED` (dim). Numbers: 10,951,542 · 11,157,269 · 12,086,648 · 12,141,004. Appear 1.6–2.2s staggered.
10. **Transmission window** — corner-handled box, 120px tall, caption `KESEY-style raw feed` → use `RM TRANSMISSION · RAW`; inside, a column of 8 pseudo-code lines (8.5px, 45% amber) duplicated once and scrolled `translateY(0→-50%)` linear 9s infinite (seamless loop).
11. **LOCK box** — corner-handled slim box: `// LOCK` (amber 8px) left, `998A ▼` / `220A ▼` right.
12. **Status dots** — 6px circles; inactive 30% ink, active amber with `rm-pulse` (opacity 1↔0.3).

## 4. Keyframes

```css
@keyframes rm-bootline { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
@keyframes rm-fillx    { from { transform:scaleX(0); } to { transform:scaleX(1); } }  /* transform-origin:left */
@keyframes rm-slidex   { from { transform:translateX(0); } to { transform:translateX(26px); } }
@keyframes rm-flicker  { 0%,100% { opacity:0.15; } 50% { opacity:0.9; } }
@keyframes rm-scrolly  { from { transform:translateY(0); } to { transform:translateY(-50%); } }
@keyframes rm-fall     { 0% { transform:translateY(0); opacity:1; } 100% { transform:translateY(54px); opacity:0; } }
@keyframes rm-rot      { to { transform:rotate(360deg); } }
@keyframes rm-pulse    { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
@keyframes rm-stamp    { 0% { opacity:0; transform:scale(2.2); } 60% { opacity:1; transform:scale(0.96); } 100% { opacity:1; transform:scale(1); } }
@keyframes rm-blink    { 0%,49% { opacity:1; } 50%,100% { opacity:0; } }
```

## 5. Boot choreography (timeline)

Every entering element uses `rm-bootline 0.3s both {delay}` — CSS delays do the cascade; JS only flips phase flags and streams the log.

| t (ms) | event |
|---|---|
| 100 | frame + dot grid visible; header band in (0.1s delay); header hairline draws `rm-fillx 0.7s` |
| 300–900 | top micro-selects (0.3/0.45s), left rail selects (0.5–0.86s), SYSTEM box (0.5s), CARRIER WAVE (0.4s) |
| 900–1300 | SEQ rows (0.9/1.05/1.2s), ARRAY chips (1.0–1.3s), career panel (0.6s) + bars fill (0.8–2.0s), patents panel (0.9s) |
| 1400–1900 | NAV modules (1.4–1.85s), //SYNC (1.4s), locks (1.5/1.65s), transmission window (1.2s), footer (0.8–1.1s) |
| 2100 | log: `> SECURE TERMINAL :: FIELD-STATION` |
| 2450 | log: `> AUTHORIZATION CHECK ········· OK` |
| 2800 | log: `> mounting /career ······· 25 YRS` |
| 3150 | log: `> patents ········· [4/4] GRANTED` (dim) |
| 3600 | log: `> WELCOME, OPERATOR` (amber) |
| 4200 | `<BOOT SEQUENCE COMPLETE>` eyebrow + payoff button appears (`rm-stamp 0.35s`); label **scramble-decodes** over 1000ms |
| 5300 | subtitle `ENTERPRISE ARCHITECT · EST. 1997 · 0 FAILURES` |
| 5800 | footer appends ` · STANDING BY` |

Log lines: JetBrains Mono 12px, line-height 1.95, `white-space: pre`, middle dots (·) as leaders.

**Scramble-decode algorithm** (used for the button label): target `APPLICATION READY TO DEPLOY`; tick every 40ms for 1000ms (25 steps); at step i, the first `round(i/steps × len)` chars are settled, the rest (except spaces) cycle randomly through `#$%&@*+=?!<>/0123456789ABCDEF`.

## 6. Payoff button

- Solid `#F5A524`, text `#0A0A0B`, JetBrains Mono 15px / 700 / tracking 0.16em, padding 18px 32px, trailing `▶` (13px), sharp corners
- Glow: `box-shadow: 0 0 40px rgba(245,165,36,0.25)`
- Hover: `translateY(-3px)` + `0 8px 50px rgba(245,165,36,0.4)` (0.2s)
- Enter animation: `rm-stamp 0.35s both` + scramble label
- **Click → dismiss**: overlay fades/wipes out 0.5s and unmounts, revealing the hero. (Recommended: fade opacity + slight scale to 1.02 on the whole console.)

## 7. Behavior & accessibility

- **The overlay does not auto-dismiss.** Boot runs ~6s to the button; the user clicks to enter. Provide `PRESS ANY KEY TO SKIP` affordance: any keypress or click anywhere from t=0 jumps straight to the completed state (all widgets on, log complete, button shown) — never trap the visitor.
- **Once per session:** `sessionStorage` flag; repeat views skip the choreography and mount the completed console for ~0.8s (or skip the overlay entirely — implementer's choice, flag it for review).
- **`prefers-reduced-motion`:** skip all entrance/scramble animation; render the completed console statically with the button, no infinite loops (sliders, flicker, orbit, scroll paused).
- Pause all `setInterval`s (clock, connection counter) and CSS loops when `document.hidden`.
- The live clock is the real client time (HH:MM:SS); connection counter starts at 887652 and adds 0–40/s.
- All timers/intervals must be cleaned up on unmount. Intervals should self-terminate (max-tick pattern) or be cleared on dismiss.
- NAV modules are real links (skip boot + anchor scroll). Everything else is decorative — `aria-hidden="true"` on the greebles; the overlay root gets `role="status"`, `aria-label="Site loading"`; the payoff button is a real `<button>` and the primary focus target when it appears.

## 8. State (single island)

`phase` (assembling → log → ready), `logLines: {text,color}[]`, `buttonLabel` (scramble output), `subtitle`, `clock`, `connection`, `dismissed`. Widget stagger data (delays, speeds, tick heights) generated once at module scope with seeded randomness so SSR/CSR don't mismatch — or generate client-only since the island is client-rendered.
