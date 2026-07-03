// WebAudio sine blips. On by default; the nav toggle flips it.
// State lives on window so every bundle (Astro scripts, React islands) shares it.
type RMSound = { on: boolean; ctx?: AudioContext; unlockBound?: boolean };

declare global {
  interface Window { __rmSound?: RMSound }
}

function store(): RMSound {
  if (!window.__rmSound) window.__rmSound = { on: true };
  return window.__rmSound;
}

// Browsers keep an AudioContext suspended until the page gets a real user
// gesture. Bind a one-time unlock to the very first pointer/key gesture
// (the boot LAUNCH click on first visit) so hover blips work right away.
function unlock(): void {
  try {
    const s = store();
    if (!s.ctx) s.ctx = new AudioContext();
    if (s.ctx.state === 'suspended') s.ctx.resume().catch(() => {});
  } catch {
    /* audio unavailable */
  }
}

function bindUnlock(): void {
  const s = store();
  if (s.unlockBound) return;
  s.unlockBound = true;
  window.addEventListener('pointerdown', unlock, { once: true, capture: true });
  window.addEventListener('keydown', unlock, { once: true, capture: true });
}

if (typeof window !== 'undefined') bindUnlock();

export function soundOn(): boolean {
  return store().on;
}

export function setSound(on: boolean): void {
  store().on = on;
  if (on) blip(880, 0.05); // confirm blip on enable
}

function play(ctx: AudioContext, freq: number, gain: number): void {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  g.gain.setValueAtTime(gain, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.09);
}

export function blip(freq: number, gain: number): void {
  try {
    const s = store();
    if (!s.ctx) s.ctx = new AudioContext();
    const ctx = s.ctx;
    if (ctx.state === 'suspended') {
      // Never schedule into a suspended context (it would queue stale blips);
      // resume first — rejects harmlessly if no gesture has happened yet.
      ctx.resume().then(() => play(ctx, freq, gain)).catch(() => {});
      return;
    }
    play(ctx, freq, gain);
  } catch {
    /* audio unavailable */
  }
}
