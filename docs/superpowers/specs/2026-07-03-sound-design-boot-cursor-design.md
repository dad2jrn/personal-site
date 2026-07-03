# Sound Design, Boot Overlay Replay, and Cursor Inversion — Design

Date: 2026-07-03
Status: Approved

## Goal

Give the site a 2Advanced-style audio layer (ambient music loop + sampled UI
sounds from `public/sounds/`), replay the boot overlay on every home-page
load, and make the custom cursor invert to black over solid accent surfaces.

## 1. Sound engine — extend `src/scripts/sound.ts`

No new dependencies. Keep the existing WebAudio `AudioContext`, the shared
`window.__rmSound` state, the gesture unlock, and the nav SOUND toggle.

Add on top:

- **Sample playback.** Fetch each `.ogg` once, decode with
  `decodeAudioData`, cache the `AudioBuffer`. Expose
  `sfx(name)` where `name` is one of
  `hover | click | open | deny | boot | launch | type`.
  Each call plays a fresh `AudioBufferSourceNode` so rapid retriggers
  (hover sweeps) overlap cleanly. Small samples (hover, click, open, deny)
  are prefetched at init; the rest load lazily on first use.
- **Music loop.** `startMusic()` / `stopMusic()` play
  `/sounds/mainLoop.ogg` as an infinite `loop = true` buffer source through
  a dedicated gain node at ~0.25 so effects sit above it. Music attempts to
  start on page load; if the browser blocks it (no prior gesture), it starts
  on the existing first-gesture unlock. The nav SOUND toggle stops/starts
  music in addition to gating effects.
- **Existing `blip()`** stays for anything not remapped (e.g. the
  sound-toggle confirm blip); the sine hover blip call sites are replaced.

### Event → file mapping

| Event | File |
|---|---|
| Hover on `a`/`button` (CustomCursor `mouseover`) | `hover.ogg` (replaces 1400 Hz blip) |
| Click on `a`/`button` (global capture listener) | `buttonpress1.ogg` |
| Patent accordion open / close (`PatentAccordion.tsx`) | `open.ogg` / `deny.ogg` (replaces 660 Hz blip) |
| Boot overlay text lines animating (`BootOverlay.astro`) | `PixelAnimate.ogg` |
| LAUNCH button press | `deephit-withglitch.ogg` |
| EmailDecoder scramble (`EmailDecoder.tsx`) | `typearrayloop.ogg` |
| Ambient music after launch (site-wide) | `mainLoop.ogg`, looping |

Unused for now: `musicLoop1.ogg`, `typearrayloop_fullscan.ogg`.

All playback respects `soundOn()`.

## 2. Boot overlay replays on every home-page load

Remove the `sessionStorage` gate in
`src/components/home/BootOverlay.astro`. The overlay then shows on every
load of `/` — refreshes and internal navigation back to home alike. LAUNCH
click still dismisses it and doubles as the WebAudio unlock gesture.

**Accepted limitation (browser autoplay policy):** on a fresh visit with no
prior gesture, `PixelAnimate.ogg` cannot play during the boot text; playback
is attempted and failure ignored. `deephit-withglitch.ogg` always plays
because the LAUNCH press is itself a gesture. Music restarts on each MPA
navigation, resuming on load where allowed, otherwise on first interaction.

## 3. Cursor inversion via mix-blend-mode

Add `mix-blend-mode: difference` to the cursor dot and ring in
`src/components/home/islands/CustomCursor.tsx`. The accent-amber
(`#F5A524`) cursor renders as pure black over accent-colored surfaces
(difference of identical colors is black), stays amber over the near-black
background, and blends per-pixel — a cursor half-over a button is half
black, half amber. No JS hit-testing.

Known side effect (accepted): the cursor also inverts over amber text
glyphs it crosses.

## 4. Hover sound replacement

Covered by the mapping above: `CustomCursor.tsx`'s
`blip(1400, 0.02)` on hot-target hover becomes `sfx('hover')`.

## Testing

Manual, in a real browser (`npm run preview` or `astro dev`):

- Boot overlay replays on refresh and on nav back to home; LAUNCH plays
  the deep-hit sound and dismisses.
- Hover plays `hover.ogg`; click plays `buttonpress1.ogg`; accordion
  open/close plays `open.ogg`/`deny.ogg`; contact decoder plays the type
  loop while scrambling.
- Music loops continuously, sits under the effects, and stops/starts with
  the nav SOUND toggle; toggle OFF silences everything.
- Cursor dot/ring render black over `.btn-solid` and over the hovered
  LAUNCH button, including partial overlap; normal amber elsewhere.
- `npm run build` succeeds; no console errors with sound off or on
  first-visit autoplay block.
