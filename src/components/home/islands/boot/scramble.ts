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
