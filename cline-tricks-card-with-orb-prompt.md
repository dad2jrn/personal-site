# Task: Finish the Capital One Visual by Porting the Full T.RICKS Webflow Glass Card Effect

## Goal

Replace only the Capital One case study visual with a faithful T.RICKS-style Webflow glass card effect.

The current implementation is moving in the right direction, but it is missing the animated organic orb/blob behind the glass card. The final visual should resemble the T.RICKS reference much more closely:

https://tricks-glassmorphism.webflow.io/

This is a fidelity pass. Do **not** customize it back to Capital One branding yet.

The visual should include:

- dark purple/blue visual surface
- purple/pink glow layers
- organic animated orb/blob behind the card
- tilted translucent glass card
- pale multi-opacity card border
- low-opacity simple card content
- huge clipped internal radial shine
- existing dotted grid still visible
- existing bottom-left tag still visible

Do not create a realistic Capital One credit card.  
Do not make the card teal.  
Do not use the Capital One logo yet.  
Do not add a chip or contactless arcs.  
Do not import Webflow global CSS or Webflow JS.

---

## Scope

Modify only the Capital One case study visual area.

Do not modify:

- the outer case study card container
- card border
- heading
- subtitle
- technology pills
- `VIEW CASE STUDY →` link
- VDOT visual
- global layout
- global typography
- unrelated components

Preserve:

- existing visual wrapper dimensions
- existing dotted grid/background
- existing bottom-left tag overlay
- surrounding case study card chrome

---

## First Inspect the Project

Before editing code:

1. Locate the Capital One case study card component.
2. Locate the current visual wrapper for that card.
3. Locate how the dotted grid/background is implemented.
4. Locate the bottom-left tag overlay.
5. Identify the styling system:
   - React CSS file
   - CSS modules
   - Tailwind
   - Astro styles
   - global CSS
   - another existing pattern
6. Follow the existing project pattern.

Do not introduce a new styling system.

---

## Required Markup

Inside the existing Capital One visual wrapper, implement this structure.

Adapt class names only if the project has a clear naming convention.

```html
<div class="co-tricks-visual" aria-hidden="true">
  <div class="co-tricks-bg"></div>

  <div class="co-tricks-glow co-tricks-glow--purple"></div>
  <div class="co-tricks-glow co-tricks-glow--pink"></div>

  <div class="co-tricks-orb" aria-hidden="true">
    <div class="co-tricks-orb-core"></div>
  </div>

  <div class="co-tricks-card-contain">
    <div class="co-tricks-card">
      <div class="co-tricks-card-content">
        <div class="co-tricks-card-top">
          <div class="co-tricks-card-logo">TRICKS</div>
        </div>

        <div class="co-tricks-card-shine"></div>

        <div class="co-tricks-card-bottom">
          <p class="co-tricks-card-text">4323 7645 2828 0713</p>
          <div class="co-tricks-card-bar" aria-hidden="true"></div>
        </div>
      </div>
    </div>
  </div>
</div>
```

Important:

- Do not use Webflow SVG assets.
- Do not hotlink anything from Webflow.
- Recreate `TRICKS` as text.
- Recreate the white bar as CSS.
- Keep the fake number for now.
- This is temporary visual scaffolding to match the reference.

---

## Layering Requirement

Inside the existing visual wrapper, the layer order should be:

```text
existing dotted grid/background: z-index 0
co-tricks-visual:              z-index 1
co-tricks-bg:                  z-index 0 inside visual
co-tricks-glow layers:         z-index 1 inside visual
co-tricks-orb:                 z-index 2 inside visual
co-tricks-card-contain:        z-index 3 inside visual
existing bottom-left tag:      z-index 4 or higher
```

Ensure the existing visual wrapper has:

```css
position: relative;
overflow: hidden;
isolation: isolate;
```

Only add these if missing.

The bottom-left tag must remain visible above everything.

The dotted grid must remain visible. If it competes visually, keep it subtle, but do not remove it.

---

## CSS Baseline

Add or adapt the following CSS in the project’s existing styling pattern.

Do not import Webflow’s full CSS.

Do not import Webflow reset styles.

Do not change global `body`, `h1`, `p`, `a`, `.container`, `.section`, `.w-*`, or unrelated classes.

```css
.co-tricks-visual {
  --co-tricks-blue: #0d0628;
  --co-tricks-ghost-white: #eeedf2;
  --co-tricks-pink: #f88cd4;
  --co-tricks-purple: #5c31ff;
  --co-tricks-shine: #1c1341de;
  --co-tricks-shine-transparent: #1c134100;

  position: absolute;
  inset: 0;
  z-index: 1;
  overflow: hidden;
  pointer-events: none;
  color: var(--co-tricks-blue);
  font-size: clamp(4px, 0.58vw, 8px);
}

.co-tricks-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  background-image:
    radial-gradient(circle farthest-corner at 50% 50%, #0d062800 72%, var(--co-tricks-blue)),
    linear-gradient(270deg, var(--co-tricks-blue), #0d062800 4%),
    linear-gradient(to right, var(--co-tricks-blue), #0d062800 4%),
    linear-gradient(to top, var(--co-tricks-blue), #0d062800 4%, #0d062800),
    linear-gradient(to bottom, var(--co-tricks-blue), #0d062800 4%, #0d062800);
}

.co-tricks-glow {
  position: absolute;
  z-index: 1;
  border-radius: 100vw;
  pointer-events: none;
  transform: translate3d(0, 0, 0);
}

.co-tricks-glow--purple {
  background-image: radial-gradient(
    circle farthest-corner at 50% 50%,
    var(--co-tricks-purple),
    #5c31ff00 69%
  );
  opacity: 0.9;
  width: 200em;
  height: 200em;
  right: 0;
  bottom: 0;
  margin-bottom: -133.1em;
  margin-right: -135.7em;
}

.co-tricks-glow--pink {
  background-image: radial-gradient(
    circle farthest-corner at 50% 50%,
    var(--co-tricks-pink),
    #f88cd400 69%
  );
  opacity: 0.73;
  width: 160em;
  height: 160em;
  right: 0;
  bottom: 0;
  margin-bottom: -133.7em;
  margin-right: -40.6em;
}

/* Organic animated orb/blob behind the card */
.co-tricks-orb {
  position: absolute;
  z-index: 2;
  width: 42em;
  height: 42em;
  left: 52%;
  top: 50%;
  transform: translate(-46%, -48%);
  pointer-events: none;
  filter: blur(0.2em);
  opacity: 0.95;
  mix-blend-mode: screen;
}

.co-tricks-orb-core {
  position: absolute;
  inset: 10%;
  border-radius: 39% 61% 47% 53% / 44% 38% 62% 56%;
  background:
    radial-gradient(circle at 42% 38%, rgba(238, 237, 242, 0.72), transparent 0 11%, transparent 22%),
    radial-gradient(circle at 56% 48%, rgba(248, 140, 212, 0.92), transparent 0 22%, transparent 46%),
    radial-gradient(circle at 42% 58%, rgba(92, 49, 255, 0.95), transparent 0 28%, transparent 58%),
    radial-gradient(circle at 60% 62%, rgba(13, 6, 40, 0.95), transparent 0 26%, transparent 54%),
    conic-gradient(
      from 120deg,
      rgba(92, 49, 255, 0.95),
      rgba(248, 140, 212, 0.82),
      rgba(238, 237, 242, 0.55),
      rgba(92, 49, 255, 0.88),
      rgba(13, 6, 40, 0.9),
      rgba(92, 49, 255, 0.95)
    );
  box-shadow:
    0 0 5em rgba(92, 49, 255, 0.48),
    0 0 8em rgba(248, 140, 212, 0.28);
  opacity: 0.92;
  transform: rotate(0deg) scale(1);
  animation: co-tricks-orb-morph 18s linear infinite;
}

.co-tricks-orb-core::before,
.co-tricks-orb-core::after {
  content: "";
  position: absolute;
  inset: -8%;
  border-radius: inherit;
  pointer-events: none;
}

.co-tricks-orb-core::before {
  background:
    radial-gradient(circle at 48% 22%, rgba(238, 237, 242, 0.75), transparent 0 8%, transparent 18%),
    radial-gradient(circle at 36% 70%, rgba(248, 140, 212, 0.65), transparent 0 18%, transparent 42%),
    radial-gradient(circle at 66% 56%, rgba(92, 49, 255, 0.82), transparent 0 20%, transparent 46%);
  filter: blur(0.45em);
  opacity: 0.75;
  mix-blend-mode: screen;
  animation: co-tricks-orb-inner 14s ease-in-out infinite;
}

.co-tricks-orb-core::after {
  inset: 12%;
  border: 0.7em solid rgba(238, 237, 242, 0.12);
  border-left-color: rgba(248, 140, 212, 0.28);
  border-bottom-color: rgba(92, 49, 255, 0.32);
  filter: blur(0.25em);
  opacity: 0.65;
  animation: co-tricks-orb-ring 22s linear infinite;
}

/* Card container */
.co-tricks-card-contain {
  position: absolute;
  inset: 0;
  z-index: 3;
  perspective: 2000em;
  color: var(--co-tricks-blue);
  justify-content: center;
  align-items: center;
  display: flex;
  pointer-events: none;
}

/* T.RICKS glass card */
.co-tricks-card {
  width: 38em;
  min-width: 38em;
  height: 24em;
  transform-style: preserve-3d;
  background-image: linear-gradient(144deg, #eeedf24d, #fff0 43%);
  border: 2px solid #eeedf257;
  border-top-color: #eeedf22e;
  border-radius: 2em;
  position: relative;
  transform: rotateX(20deg) rotateY(-3deg) rotateZ(-9deg);
  backdrop-filter: blur(2em);
  -webkit-backdrop-filter: blur(2em);
  animation: co-tricks-card-float 14s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

.co-tricks-card-content {
  position: relative;
  border-radius: 2em;
  flex-direction: column;
  justify-content: space-between;
  align-items: stretch;
  width: 100%;
  height: 100%;
  padding: 2.6em;
  display: flex;
  overflow: hidden;
  -webkit-mask-image: -webkit-radial-gradient(white, black);
}

.co-tricks-card-top,
.co-tricks-card-bottom {
  position: relative;
  z-index: 2;
  opacity: 0.6;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  display: flex;
}

.co-tricks-card-logo {
  color: var(--co-tricks-ghost-white);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-family: inherit;
  font-size: 1.15em;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
}

.co-tricks-card-text {
  color: var(--co-tricks-ghost-white);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  justify-content: center;
  align-items: center;
  font-family: inherit;
  font-size: 1.4em;
  font-weight: 700;
  line-height: 1;
  margin: 0;
  white-space: nowrap;
}

.co-tricks-card-bar {
  width: 3.5em;
  height: 0.7em;
  border-radius: 100vw;
  background: var(--co-tricks-ghost-white);
}

.co-tricks-card-shine {
  background-image: radial-gradient(
    circle,
    var(--co-tricks-shine),
    var(--co-tricks-shine-transparent) 61%
  );
  border-radius: 100vw;
  width: 60em;
  height: 60em;
  margin-top: -30.4em;
  margin-left: -25.7em;
  position: absolute;
  inset: 0% auto auto 0%;
  z-index: 1;
  pointer-events: none;
  animation: co-tricks-shine-drift 14s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
```

---

## Required Keyframes

Add these keyframes.

```css
@keyframes co-tricks-orb-morph {
  0% {
    border-radius: 39% 61% 47% 53% / 44% 38% 62% 56%;
    transform: rotate(0deg) scale(1);
  }

  25% {
    border-radius: 52% 48% 39% 61% / 58% 42% 58% 42%;
    transform: rotate(90deg) scale(1.04);
  }

  50% {
    border-radius: 63% 37% 56% 44% / 42% 60% 40% 58%;
    transform: rotate(180deg) scale(0.98);
  }

  75% {
    border-radius: 45% 55% 62% 38% / 52% 44% 56% 48%;
    transform: rotate(270deg) scale(1.03);
  }

  100% {
    border-radius: 39% 61% 47% 53% / 44% 38% 62% 56%;
    transform: rotate(360deg) scale(1);
  }
}

@keyframes co-tricks-orb-inner {
  0%, 100% {
    transform: translate3d(-3%, 2%, 0) rotate(0deg) scale(1);
    opacity: 0.72;
  }

  50% {
    transform: translate3d(4%, -3%, 0) rotate(-18deg) scale(1.08);
    opacity: 0.92;
  }
}

@keyframes co-tricks-orb-ring {
  0% {
    transform: rotate(0deg) scale(1);
  }

  100% {
    transform: rotate(-360deg) scale(1.02);
  }
}

@keyframes co-tricks-card-float {
  0%, 100% {
    transform: rotateX(20deg) rotateY(-3deg) rotateZ(-9deg);
  }

  50% {
    transform: rotateX(22deg) rotateY(3deg) rotateZ(-8deg);
  }
}

@keyframes co-tricks-shine-drift {
  0%, 100% {
    transform: translate3d(0em, 0, 0);
  }

  50% {
    transform: translate3d(16em, 0, 0);
  }
}
```

---

## Reduced Motion

Add reduced-motion handling.

```css
@media (prefers-reduced-motion: reduce) {
  .co-tricks-orb-core,
  .co-tricks-orb-core::before,
  .co-tricks-orb-core::after,
  .co-tricks-card,
  .co-tricks-card-shine {
    animation: none;
  }

  .co-tricks-card {
    transform: rotateX(20deg) rotateY(-3deg) rotateZ(-9deg);
  }

  .co-tricks-card-shine {
    transform: translate3d(8em, 0, 0);
  }
}
```

---

## Sizing and Composition Notes

The original Webflow site uses `body { font-size: 1vw; }`, which makes all `em` units scale from the viewport.

Do not change the global `body` font-size.

Use `.co-tricks-visual` to control local scaling only.

If the visual is too small or too large, adjust only:

```css
.co-tricks-visual {
  font-size: clamp(4px, 0.58vw, 8px);
}
```

Try these alternatives if needed:

```css
font-size: clamp(5px, 0.68vw, 10px);
```

or:

```css
font-size: clamp(4px, 0.5vw, 7px);
```

The orb should sit behind the card and be visible:

- above the card
- below the card
- around the right edge
- subtly through the glass

If needed, adjust only:

```css
.co-tricks-orb {
  left: 52%;
  top: 50%;
  transform: translate(-46%, -48%);
}
```

The orb should not sit on top of the card.

The card should remain visually dominant.

---

## Do Not Customize Yet

This is still a fidelity pass.

Do not:

- use the Capital One logo
- make the card teal
- add a chip
- add contactless arcs
- replace the fake number with dots yet
- add realistic banking details
- use Webflow CDN assets
- import Webflow global CSS
- import Webflow JS
- import jQuery
- import Anime.js
- add the noise canvas
- hotlink the Webflow video

The goal is to make the visual match the Webflow/T.RICKS feel inside the existing case-study card.

---

## Acceptance Criteria

Before finishing, verify:

- Only the Capital One visual changed.
- The VDOT card did not change.
- The surrounding case study card UI is unchanged.
- The existing dotted grid remains.
- The existing bottom-left tag remains visible.
- The result visually resembles the Webflow/T.RICKS card.
- The animated organic orb/blob is visible behind the card.
- The orb is not on top of the card.
- The purple and pink glows are visible behind the card.
- The card is tilted.
- The card is translucent.
- The card is not teal-filled.
- The card has the pale glass border.
- The content is low opacity.
- The huge internal radial shine is visible and clipped inside the card.
- No remote Webflow SVG assets are used.
- No Webflow global CSS is imported.
- No Webflow JS, jQuery, Anime.js, or noise canvas is imported.
- No new dependency is added.
- Reduced motion works.

---

## Final Response

When done, summarize:

1. Which files changed.
2. Where the Capital One visual markup was updated.
3. Where the T.RICKS-specific CSS was added.
4. Whether the animated orb/blob was added behind the card.
5. Whether the visual is now ready for a second pass to adapt the colors/content back toward Capital One branding.
