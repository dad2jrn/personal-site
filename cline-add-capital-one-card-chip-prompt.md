# Task: Add a Subtle Chip to the Existing Capital One Glass Card Visual

## Goal

The current Capital One/T.RICKS-style glass card visual is good. Keep the current composition, animation, orb, glow, card tilt, glass effect, and layout.

Only add a subtle credit-card chip to the glass card.

Do not redesign the visual.

---

## Scope

Modify only the Capital One visual.

Do not modify:

- VDOT visual
- outer case study card
- heading
- subtitle
- `VIEW CASE STUDY →` link
- dotted grid
- bottom-left visual tag
- orb/blob
- purple/pink glow
- card tilt
- card animation
- internal shine
- card border
- card size

---

## Placement

Add the chip inside the glass card face.

The chip should be positioned:

- left side of the card
- below the `CAPITAL ONE` text
- above the card number
- approximately where a real chip would sit
- aligned with the existing card content padding

Suggested markup inside `.co-tricks-card-content`:

```html
<div class="co-tricks-card-chip" aria-hidden="true">
  <span></span>
  <span></span>
  <span></span>
</div>
```

Place it after the top row and before the card number/bottom row.

Make sure it sits above the internal shine layer visually.

---

## CSS

Add CSS similar to this, adapting selectors to the project if needed:

```css
.co-tricks-card-chip {
  position: absolute;
  left: 2.6em;
  top: 8.6em;
  z-index: 2;
  width: 5.2em;
  height: 3.8em;
  border-radius: 0.55em;
  background:
    linear-gradient(135deg, rgba(238, 237, 242, 0.42), rgba(238, 237, 242, 0.12)),
    rgba(238, 237, 242, 0.16);
  border: 1px solid rgba(238, 237, 242, 0.32);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.26),
    0 0 1.4em rgba(238, 237, 242, 0.08);
  opacity: 0.62;
  overflow: hidden;
}

.co-tricks-card-chip::before,
.co-tricks-card-chip::after {
  content: "";
  position: absolute;
  background: rgba(238, 237, 242, 0.22);
}

.co-tricks-card-chip::before {
  left: 50%;
  top: 0;
  width: 1px;
  height: 100%;
}

.co-tricks-card-chip::after {
  left: 0;
  top: 50%;
  width: 100%;
  height: 1px;
}

.co-tricks-card-chip span {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(238, 237, 242, 0.16);
}

.co-tricks-card-chip span:nth-child(1) {
  top: 28%;
}

.co-tricks-card-chip span:nth-child(2) {
  top: 50%;
}

.co-tricks-card-chip span:nth-child(3) {
  top: 72%;
}
```

---

## Visual Rules

The chip should be:

- subtle
- semi-transparent
- glass-compatible
- low opacity
- not bright gold
- not realistic yellow metal
- not visually louder than the logo or number
- integrated into the current frosted glass look

Do not add animation to the chip.

Do not add a contactless icon.

Do not make the card more opaque.

Do not change the orb or shine.

---

## Acceptance Criteria

Before finishing, verify:

- The chip appears on the card.
- The chip is placed below `CAPITAL ONE` and above the number.
- The chip is subtle and semi-transparent.
- The card still looks like the current glass card.
- The orb/blob remains visible behind the card.
- The existing animation still works.
- Reduced motion still works.
- No unrelated files or components were changed.

---

## Final Response

Summarize:

1. Which file changed.
2. Where the chip markup was added.
3. Where the chip CSS was added.
4. Confirm no other visual behavior was changed.
