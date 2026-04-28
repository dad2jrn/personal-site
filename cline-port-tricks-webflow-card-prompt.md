# Task: Port the Webflow T.RICKS Glass Card Visual Into the Existing Capital One Case Study Visual

## Goal

Replace only the current Capital One case study visual with a faithful port of the Webflow/T.RICKS glass card visual supplied below.

Do **not** create a generic glassmorphism card.

Do **not** create a realistic Capital One credit-card mockup yet.

Do **not** use the remote Webflow SVG assets.

The goal of this pass is to reproduce the **actual T.RICKS visual language** inside the existing Capital One visual area:

- tilted translucent glass card
- low-opacity content
- pale multi-opacity border
- large clipped internal radial shine
- purple/pink external glows
- simple top/bottom card layout
- dark video-like visual surface
- no teal bank-card look

Once this looks right, a second pass can customize the color/content back toward Capital One.

---

## Source of Truth

Use the HTML and CSS below as the source of truth.

### Webflow HTML Structure

The relevant Webflow markup is:

```html
<div class="hero__right">
  <div class="hero__video w-background-video w-background-video-atom">
    <video autoplay loop muted playsinline data-object-fit="cover">
      <source src="blue-bg-transcode.mp4" />
      <source src="blue-bg-transcode.webm" />
    </video>
  </div>

  <div class="hero__gradient"></div>
  <div class="hero__gradient is--other"></div>

  <div class="hero__card-contain">
    <div class="hero__card">
      <div class="hero__card-content">
        <div class="hero__card-top">
          <img src="white-logo.svg" loading="lazy" alt="" class="hero__card-logo" />
        </div>

        <div class="hero__card-shine"></div>

        <div class="hero__card-bottom">
          <p class="hero__card-text">4323 7645 2828 0713</p>
          <img src="white-bar.svg" loading="lazy" alt="" class="hero__card-bar" />
        </div>
      </div>
    </div>
  </div>
</div>
```

For this implementation, **do not use the remote SVG assets**. Replace the logo and bar images with simple HTML/CSS equivalents.

Use:

```html
<div class="tricks-card-logo">TRICKS</div>
<div class="tricks-card-bar" aria-hidden="true"></div>
```

---

## Relevant Webflow CSS to Port

These are the relevant Webflow styles:

```css
:root {
  --blue: #0d0628;
  --ghost-white: #eeedf2;
  --pink: #f88cd4;
  --purple: #5c31ff;
  --grey: #1c1c1c;
  --yellow: #def141;
}

.hero__right {
  z-index: 5;
  flex-direction: column;
  justify-content: flex-end;
  align-items: stretch;
  width: 40.7em;
  margin-right: 2.3em;
  display: flex;
  position: relative;
}

.hero__video {
  background-image:
    radial-gradient(circle farthest-corner at 50% 50%, #0d062800 72%, var(--blue)),
    linear-gradient(270deg, var(--blue), #0d062800 4%),
    linear-gradient(to right, var(--blue), #0d062800 4%),
    linear-gradient(to top, var(--blue), #0d062800 4%, #0d062800),
    linear-gradient(to bottom, var(--blue), #0d062800 4%, #0d062800);
  width: 100%;
  height: 42em;
  position: relative;
}

.hero__gradient {
  z-index: 2;
  background-image: radial-gradient(circle farthest-corner at 50% 50%, var(--purple), #5c31ff00 69%);
  opacity: .9;
  width: 200em;
  height: 200em;
  margin-bottom: -133.1em;
  margin-right: -135.7em;
  position: fixed;
  inset: auto 0% 0% auto;
}

.hero__gradient.is--other {
  background-image: radial-gradient(circle farthest-corner at 50% 50%, var(--pink), #f88cd400 69%);
  opacity: .73;
  width: 160em;
  height: 160em;
  margin-bottom: -133.7em;
  margin-right: -40.6em;
}

.hero__card-contain {
  z-index: 3;
  perspective: 2000em;
  color: var(--blue);
  justify-content: center;
  align-items: center;
  display: flex;
  position: absolute;
  inset: 0%;
}

.hero__card {
  width: 38em;
  min-width: 38em;
  height: 24em;
  transform-style: preserve-3d;
  background-image: linear-gradient(144deg, #eeedf24d, #fff0 43%);
  border: 2px solid #eeedf257;
  border-top-color: #eeedf22e;
  border-radius: 2em;
  position: relative;
  transform: rotate(-9deg);
}

.hero__card {
  backdrop-filter: blur(2em);
  -webkit-backdrop-filter: blur(2em);
}

.hero__card-content {
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

.hero__card-top,
.hero__card-bottom {
  opacity: .6;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  display: flex;
}

.hero__card-logo {
  width: 6.6em;
}

.hero__card-icon,
.hero__card-bar {
  width: 3.5em;
}

.hero__card-text {
  color: var(--ghost-white);
  letter-spacing: .1em;
  text-transform: uppercase;
  justify-content: center;
  align-items: center;
  font-family: Grifter, sans-serif;
  font-size: 1.4em;
  font-weight: 700;
}

.hero__card-shine {
  background-image: radial-gradient(circle, #1c1341de, #1c134100 61%);
  border-radius: 100vw;
  width: 60em;
  height: 60em;
  margin-top: -30.4em;
  margin-left: -25.7em;
  position: absolute;
  inset: 0% auto auto 0%;
}

@media screen and (max-width: 991px) {
  .hero__card {
    transform: rotateX(20deg) rotateY(-3deg) rotateZ(-9deg);
  }
}

@media screen and (max-width: 767px) {
  .hero__right {
    width: 42em;
    margin-top: 7.2em;
    margin-left: auto;
    margin-right: auto;
    padding-right: 0;
  }

  .hero__card-shine {
    margin-top: -18.6em;
    margin-left: 26.2em;
  }
}

@media screen and (max-width: 479px) {
  .hero__right {
    width: 100%;
    margin-top: 8.4em;
  }

  .hero__video {
    height: 55em;
  }

  .hero__card {
    font-size: 1.1em;
  }
}
```

---

## Important Interpretation

The visual is **not** mainly a generic frosted card.

The T.RICKS effect comes from this specific combination:

1. A dark purple/blue surface behind the card.
2. Huge purple and pink radial glows behind the card.
3. A centered absolute card container with very large perspective.
4. A tilted translucent card.
5. A pale white diagonal gradient face.
6. A soft border with a weaker top border.
7. `backdrop-filter: blur(2em)`.
8. Low-opacity content.
9. A huge radial shine inside the card, clipped by the card content.
10. Simple top/bottom layout.

Preserve that structure.

---

## Scope

Modify only the Capital One case study visual area.

Do not modify:

- the outer case study card container
- the card border
- the heading
- the subtitle
- the technology pills
- the `VIEW CASE STUDY →` link
- the VDOT visual
- the global layout
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

## Required Implementation Strategy

Inside the existing Capital One visual wrapper, implement a self-contained T.RICKS-style visual using renamed classes.

Do **not** import the full Webflow stylesheet.

Do **not** copy Webflow reset styles.

Do **not** copy global `body`, `h1`, `p`, `a`, `.container`, `.section`, `.w-*`, or unrelated classes.

Only port the visual-specific card/glow rules.

Use project-safe class names similar to:

```text
hero__right              -> co-tricks-visual
hero__video              -> co-tricks-bg
hero__gradient           -> co-tricks-glow co-tricks-glow--purple
hero__gradient.is--other -> co-tricks-glow co-tricks-glow--pink
hero__card-contain       -> co-tricks-card-contain
hero__card               -> co-tricks-card
hero__card-content       -> co-tricks-card-content
hero__card-top           -> co-tricks-card-top
hero__card-bottom        -> co-tricks-card-bottom
hero__card-logo          -> co-tricks-card-logo
hero__card-text          -> co-tricks-card-text
hero__card-bar           -> co-tricks-card-bar
hero__card-shine         -> co-tricks-card-shine
```

Use the actual naming convention of the project if different.

---

## Target Markup

Use this structure inside the existing Capital One visual wrapper:

```html
<div class="co-tricks-visual" aria-hidden="true">
  <div class="co-tricks-bg"></div>

  <div class="co-tricks-glow co-tricks-glow--purple"></div>
  <div class="co-tricks-glow co-tricks-glow--pink"></div>

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

- Do not use the Webflow logo SVG.
- Do not use the Webflow bar SVG.
- Do not use CDN asset references.
- Recreate the logo as text.
- Recreate the bar as a CSS rounded rectangle.
- Keep `TRICKS` and the fake number for this fidelity pass.
- Do not customize to Capital One yet.

---

## Layering Requirement

Inside the existing visual wrapper, the layer order should be:

```text
existing dotted grid/background: z-index 0
co-tricks-visual:              z-index 1
co-tricks-bg:                  z-index 0 inside visual
co-tricks-glow layers:         z-index 1 inside visual
co-tricks-card-contain:        z-index 2 inside visual
existing bottom-left tag:      z-index 3 or higher
```

Ensure the existing visual wrapper has these properties:

```css
position: relative;
overflow: hidden;
isolation: isolate;
```

Only add them if missing.

The bottom-left tag must remain visible above the visual.

The dotted grid must remain visible. If it competes visually, keep it subtle, but do not remove it.

---

## CSS Baseline to Implement

Adapt this CSS into the project’s styling system.

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

.co-tricks-card-contain {
  position: absolute;
  inset: 0;
  z-index: 2;
  perspective: 2000em;
  color: var(--co-tricks-blue);
  justify-content: center;
  align-items: center;
  display: flex;
  pointer-events: none;
}

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
  transform: rotate(-9deg);
  backdrop-filter: blur(2em);
  -webkit-backdrop-filter: blur(2em);
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
}
```

---

## Sizing Notes

The original Webflow site uses `body { font-size: 1vw; }`, which makes all `em` units scale from the viewport.

Your project likely does not use that exact setup.

Therefore, make the T.RICKS visual define its own local font-size if needed.

If the card appears too large or too small inside the existing visual wrapper, adjust only `.co-tricks-visual` or `.co-tricks-card` scaling.

Preferred approach:

```css
.co-tricks-visual {
  font-size: clamp(5px, 0.68vw, 10px);
}
```

or, if the wrapper is small:

```css
.co-tricks-visual {
  font-size: clamp(4px, 0.58vw, 8px);
}
```

Do not change the global `body` font-size.

Do not import Webflow’s global `body` styles.

The target is to preserve the Webflow proportions locally inside the visual box.

---

## Optional Animation

The supplied page source does not include the Webflow interactions data in a clean reusable form. For this port, static fidelity is more important than animation.

Implement the visual static first.

If the static version matches well, add very subtle CSS animation:

```css
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

.co-tricks-card {
  animation: co-tricks-card-float 14s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

.co-tricks-card-shine {
  animation: co-tricks-shine-drift 14s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
```

If this makes the visual worse, leave the card static.

---

## Reduced Motion

If animation is added, include:

```css
@media (prefers-reduced-motion: reduce) {
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

## Do Not Customize Yet

This is a fidelity pass.

Do not:

- use the Capital One logo
- make the card teal
- add a chip
- add contactless arcs
- add real card-number styling
- add lots of bank-card details
- replace the fake number with dots yet
- remove the T.RICKS purple/pink colors
- use Webflow CDN assets
- import Webflow global CSS
- import jQuery
- import Webflow JS
- import Anime.js
- add the noise canvas

The goal is simply to port the working Webflow visual into the existing visual box.

---

## Acceptance Criteria

Before finishing, verify:

- Only the Capital One visual changed.
- The VDOT card did not change.
- The surrounding case study card UI is unchanged.
- The existing dotted grid remains.
- The existing bottom-left tag remains visible.
- The result visually resembles the Webflow/T.RICKS card.
- The card is tilted.
- The card is translucent.
- The card is not teal-filled.
- The card has the pale glass border.
- The content is low opacity.
- The huge internal radial shine is visible and clipped inside the card.
- The purple and pink glows are visible behind the card.
- No remote Webflow SVG assets are used.
- No Webflow global CSS is imported.
- No Webflow JS, jQuery, Anime.js, or noise canvas is imported.
- No new dependency is added.

---

## Final Response

When done, summarize:

1. Which files changed.
2. Where the Capital One visual component/markup was updated.
3. Where the T.RICKS-specific CSS was added.
4. Whether the visual is static or lightly animated.
5. Whether any global styles were avoided.
6. Whether this is ready for a second pass to adapt the visual back toward Capital One branding.
