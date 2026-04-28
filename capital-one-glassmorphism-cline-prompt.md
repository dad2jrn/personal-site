# Task: Recreate the Exact T.RICKS Glass Card Inside the Capital One Visual Area

## Goal

Replace only the current Capital One visual with a near-direct recreation of the T.RICKS hero glass card inside my existing case-study visual wrapper.

Reference:

https://tricks-glassmorphism.webflow.io/

Do **not** adapt it into a realistic Capital One credit card yet.

The goal of this pass is visual fidelity to the T.RICKS card pattern.

I want the same kind of card:

- same tilted glass panel feel
- same translucent white/purple glass gradient
- same low-opacity content
- same large internal radial shine
- same border treatment
- same card proportions
- same simple top/bottom layout
- same external glow behavior
- same overall “floating glass card” composition

Only after this looks right should I later customize the branding.

---

## Important Correction

Do not create a teal Capital One credit-card mockup.

Do not make the card look like a bank card.

Do not center a large Capital One logo.

Do not add a chip.

Do not add lots of card details.

For this pass, recreate the T.RICKS card visual as closely as possible inside my card visual area.

Use placeholder text/content that mimics the T.RICKS layout.

---

## Scope

Modify only the Capital One case study visual area.

Do not modify:

- outer case-study card container
- case-study border
- heading
- subtitle
- technology pills
- `VIEW CASE STUDY →` link
- VDOT visual
- global layout
- global typography
- unrelated components

Preserve:

- the existing visual wrapper size
- the existing dotted grid
- the existing bottom-left tag overlay

The visual wrapper should remain in the same place on the page.

---

## Use the Exact T.RICKS Structure

Inside the existing Capital One visual wrapper, recreate this structure with project-safe class names.

Use this exact structure conceptually:

```html
<div class="tricks-card-contain">
  <div class="tricks-card">
    <div class="tricks-card-content">
      <div class="tricks-card-top">
        <div class="tricks-card-logo">TRICKS</div>
        <div class="tricks-card-icon" aria-hidden="true"></div>
      </div>

      <div class="tricks-card-bottom">
        <p class="tricks-card-text">4323 7645 2828 0713</p>
        <div class="tricks-card-bar" aria-hidden="true"></div>
      </div>

      <div class="tricks-card-shine"></div>
    </div>
  </div>
</div>
```

Important:

- Use `TRICKS` or another neutral placeholder text for now.
- Use the same fake number from the reference for visual matching.
- This is temporary visual scaffolding.
- Do not use the Capital One logo in this pass.
- Do not use a chip.
- Do not use contactless arcs yet unless they are visually hidden/subtle.
- The goal is to match the reference first.

---

## Required Wrapper Layering

Inside my existing visual wrapper:

```css
existing dotted grid/background: z-index 0
T.RICKS-style external glows: z-index 1
T.RICKS card container:       z-index 2
existing bottom-left tag:     z-index 3 or higher
```

Make sure the visual wrapper has:

```css
position: relative;
overflow: hidden;
isolation: isolate;
```

Only add those if missing.

---

## Add T.RICKS-Style Background Glows

The original T.RICKS page uses large radial gradients behind the card:

```css
.hero__gradient {
  position: fixed;
  right: 0%;
  bottom: 0%;
  z-index: 2;
  width: 200em;
  height: 200em;
  margin-right: -135.7em;
  margin-bottom: -133.1em;
  background-image: radial-gradient(circle farthest-corner at 50% 50%, #5c31ff, rgba(92, 49, 255, 0) 69%);
  opacity: 0.9;
}

.hero__gradient.is--other {
  width: 160em;
  height: 160em;
  margin-right: -40.6em;
  margin-bottom: -133.7em;
  background-image: radial-gradient(circle farthest-corner at 50% 50%, #f88cd4, rgba(248, 140, 212, 0) 69%);
  opacity: 0.73;
}
```

Adapt these as absolute children inside my visual wrapper.

Use T.RICKS colors for this pass:

- purple: `#5c31ff`
- pink: `#f88cd4`
- dark purple: `#0d0628`
- off-white: `#eeedf2`

Yes, use these exact colors for this pass.

Do not convert them to teal yet.

This is a fidelity pass.

Suggested wrapper glows:

```css
.tricks-glow {
  position: absolute;
  z-index: 1;
  border-radius: 100vw;
  pointer-events: none;
}

.tricks-glow--purple {
  width: 120%;
  aspect-ratio: 1;
  right: -45%;
  bottom: -65%;
  background-image: radial-gradient(
    circle farthest-corner at 50% 50%,
    #5c31ff,
    rgba(92, 49, 255, 0) 69%
  );
  opacity: 0.75;
}

.tricks-glow--pink {
  width: 90%;
  aspect-ratio: 1;
  right: 5%;
  bottom: -75%;
  background-image: radial-gradient(
    circle farthest-corner at 50% 50%,
    #f88cd4,
    rgba(248, 140, 212, 0) 69%
  );
  opacity: 0.55;
}
```

These glows should sit behind the card and create the same luminous atmosphere as T.RICKS.

---

## Use the Exact T.RICKS Card CSS

Use this as the baseline.

Scale it to fit my visual wrapper, but preserve proportions and behavior.

```css
.tricks-card-contain {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  justify-content: center;
  align-items: center;
  perspective: 2000em;
  pointer-events: none;
}

.tricks-card {
  position: relative;
  width: clamp(18rem, 52%, 34rem);
  aspect-ratio: 38 / 24;
  border-style: solid;
  border-width: 2px;
  border-color:
    rgba(238, 237, 242, 0.18)
    rgba(238, 237, 242, 0.34)
    rgba(238, 237, 242, 0.34);
  border-radius: 2em;
  background-image: linear-gradient(
    144deg,
    rgba(238, 237, 242, 0.3),
    rgba(255, 255, 255, 0) 43%
  );
  transform: rotateX(20deg) rotateY(-3deg) rotateZ(-9deg);
  transform-style: preserve-3d;
  animation: tricks-card-float 14s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  will-change: transform;
}

.tricks-card-content {
  position: relative;
  display: flex;
  overflow: hidden;
  width: 100%;
  height: 100%;
  padding: 2.6em;
  flex-direction: column;
  justify-content: space-between;
  align-items: stretch;
  border-radius: 2em;
}

.tricks-card-top,
.tricks-card-bottom {
  position: relative;
  z-index: 2;
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  opacity: 0.6;
}

.tricks-card-logo {
  color: #eeedf2;
  font-size: 1.2em;
  line-height: 1;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.tricks-card-icon {
  width: 3.5em;
  height: 3.5em;
  border-radius: 100vw;
  border: 2px solid rgba(238, 237, 242, 0.7);
  position: relative;
}

.tricks-card-icon::before {
  content: "";
  position: absolute;
  inset: 28%;
  border-radius: inherit;
  border: 2px solid rgba(238, 237, 242, 0.7);
}

.tricks-card-text {
  margin: 0;
  color: #eeedf2;
  font-size: 1.4em;
  line-height: 1;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.tricks-card-bar {
  width: 3.5em;
  height: 0.72em;
  border-radius: 100vw;
  background: #eeedf2;
}

.tricks-card-shine {
  position: absolute;
  left: 0%;
  top: 0%;
  right: auto;
  bottom: auto;
  z-index: 1;
  width: 158%;
  aspect-ratio: 1;
  margin-top: -80%;
  margin-left: -68%;
  border-radius: 100vw;
  background-image: radial-gradient(
    circle farthest-corner at 50% 50%,
    rgba(28, 19, 65, 0.87),
    rgba(28, 19, 65, 0) 61%
  );
  animation: tricks-card-shine-drift 14s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  will-change: transform;
  pointer-events: none;
}
```

Do not add a solid background color to `.tricks-card`.

Do not make `.tricks-card` teal.

Do not remove the huge `.tricks-card-shine`.

---

## Animation

The T.RICKS reference uses changing inline transforms from Webflow interactions.

Recreate that with CSS keyframes.

```css
@keyframes tricks-card-float {
  0%, 100% {
    transform: rotateX(20deg) rotateY(-3deg) rotateZ(-9deg);
  }

  50% {
    transform: rotateX(22deg) rotateY(3deg) rotateZ(-8deg);
  }
}

@keyframes tricks-card-shine-drift {
  0%, 100% {
    transform: translate3d(0em, 0, 0);
  }

  50% {
    transform: translate3d(16em, 0, 0);
  }
}
```

Keep motion slow and minimal.

No bounce.

No shimmer line.

No fast movement.

---

## Optional Backdrop Filter

Do not rely on `backdrop-filter`.

The T.RICKS reference does not need it.

You may add a very subtle version only if it improves the look:

```css
@supports ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .tricks-card {
    -webkit-backdrop-filter: blur(10px) saturate(120%);
    backdrop-filter: blur(10px) saturate(120%);
  }
}
```

If this makes the card look muddy or too opaque, remove it.

---

## Reduced Motion

Add:

```css
@media (prefers-reduced-motion: reduce) {
  .tricks-card,
  .tricks-card-shine {
    animation: none;
  }

  .tricks-card {
    transform: rotateX(20deg) rotateY(-3deg) rotateZ(-9deg);
  }

  .tricks-card-shine {
    transform: translate3d(8em, 0, 0);
  }
}
```

The visual should remain fully visible.

---

## Do Not Customize Yet

For this pass, do not try to make it a Capital One card.

That comes later.

Do not:

- use the Capital One logo
- make the card teal
- add a chip
- add real card number styling
- add many financial-card details
- make it literal

The only objective now is to get the exact T.RICKS visual language working inside my existing case-study visual area.

---

## Acceptance Criteria

The result should visually resemble the T.RICKS card much more than the current version.

Specifically:

- the card is tilted similarly
- the card is translucent, not teal-filled
- the card uses T.RICKS purple/pink/off-white colors for this pass
- the card has the same simple top/bottom layout
- the content is low-opacity
- the border has the same pale glass edge
- the huge internal radial shine is visible and clipped inside the card
- the external background glow feels like the reference
- the dotted grid and bottom-left tag still exist
- the surrounding case study card UI is untouched

---

## Final Response

When done, summarize:

1. Which files changed.
2. Which exact T.RICKS visual pieces were recreated.
3. Whether the visual is still using the temporary T.RICKS colors.
4. Whether the result is now ready for a second pass to adapt colors/content back to Capital One.
