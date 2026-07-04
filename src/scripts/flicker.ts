// Sparse, independent flicker for corner-handle squares (span.bg-ink) inside
// any [data-flicker] container. A scheduler fires at random intervals and
// picks 1–2 idle squares (never more than 2 mid-flicker at once) for a short
// burst of 1–3 dips at random speed — one square might flick once in 30s
// while another flicks twice in 10s. Skipped under prefers-reduced-motion.
export function initCornerFlicker(): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const squares = Array.from(
    document.querySelectorAll<HTMLElement>('[data-flicker] span.bg-ink'),
  ).filter((sq) => !sq.dataset.flick);
  if (!squares.length) return;
  squares.forEach((sq) => { sq.dataset.flick = '1'; });

  let busy = 0;
  const flick = (sq: HTMLElement) => {
    busy++;
    const dips = 1 + Math.floor(Math.random() * 3);
    const dur = 0.12 + Math.random() * 0.28;
    sq.style.animation = `rm-flick-burst ${dur.toFixed(2)}s linear ${dips}`;
    setTimeout(() => {
      sq.style.animation = '';
      busy--;
    }, dur * dips * 1000 + 50);
  };
  const schedule = () => {
    setTimeout(() => {
      const want = Math.random() < 0.35 ? 2 : 1;
      const room = Math.min(want, 2 - busy);
      const idle = squares.filter((s) => !s.style.animation);
      for (let k = 0; k < room && idle.length; k++) {
        flick(idle.splice(Math.floor(Math.random() * idle.length), 1)[0]);
      }
      schedule();
    }, 1500 + Math.random() * 6500);
  };
  schedule();
}
