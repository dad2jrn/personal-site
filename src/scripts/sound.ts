// WebAudio sine blips. On by default; the nav toggle flips it.
// State lives on window so every bundle (Astro scripts, React islands) shares it.
type RMSound = { on: boolean; ctx?: AudioContext };

declare global {
  interface Window { __rmSound?: RMSound }
}

function store(): RMSound {
  if (!window.__rmSound) window.__rmSound = { on: true };
  return window.__rmSound;
}

export function soundOn(): boolean {
  return store().on;
}

export function setSound(on: boolean): void {
  store().on = on;
  if (on) blip(880, 0.05); // confirm blip on enable
}

export function blip(freq: number, gain: number): void {
  try {
    const s = store();
    if (!s.ctx) s.ctx = new AudioContext(); // lazily created on first use
    const ctx = s.ctx;
    // Autoplay policy: the context stays suspended until the page has had a
    // real user gesture (the boot LAUNCH click provides one on first visit).
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
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
  } catch {
    /* audio unavailable */
  }
}
