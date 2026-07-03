// WebAudio engine: sampled UI sounds + ambient music loop + legacy sine blips.
// On by default; the nav toggle flips it. State lives on window so every
// bundle (Astro scripts, React islands) shares it; the ON flag persists
// across page loads in sessionStorage.

export type SfxName = 'hover' | 'click' | 'open' | 'deny' | 'boot' | 'launch' | 'type';

type RMSound = {
  on: boolean;
  ctx?: AudioContext;
  unlockBound?: boolean;
  clickBound?: boolean;
  buffers?: Map<string, Promise<AudioBuffer>>;
  musicSrc?: AudioBufferSourceNode;
};

declare global {
  interface Window { __rmSound?: RMSound }
}

const SFX: Record<SfxName, { url: string; gain: number }> = {
  hover: { url: '/sounds/hover.ogg', gain: 0.35 },
  click: { url: '/sounds/buttonpress1.ogg', gain: 0.5 },
  open: { url: '/sounds/open.ogg', gain: 0.5 },
  deny: { url: '/sounds/deny.ogg', gain: 0.5 },
  boot: { url: '/sounds/PixelAnimate.ogg', gain: 0.6 },
  launch: { url: '/sounds/deephit-withglitch.ogg', gain: 0.7 },
  type: { url: '/sounds/typearrayloop.ogg', gain: 0.4 },
};

const MUSIC_URL = '/sounds/mainLoop.ogg';
const MUSIC_GAIN = 0.25;

function store(): RMSound {
  if (!window.__rmSound) {
    let on = true;
    try { on = sessionStorage.getItem('rm-sound') !== 'off'; } catch { /* private mode */ }
    window.__rmSound = { on };
  }
  return window.__rmSound;
}

function ctx(): AudioContext {
  const s = store();
  if (!s.ctx) s.ctx = new AudioContext();
  return s.ctx;
}

function loadBuffer(url: string): Promise<AudioBuffer> {
  const s = store();
  if (!s.buffers) s.buffers = new Map();
  let p = s.buffers.get(url);
  if (!p) {
    p = fetch(url).then((r) => r.arrayBuffer()).then((data) => ctx().decodeAudioData(data));
    s.buffers.set(url, p);
  }
  return p;
}

function playBuffer(buffer: AudioBuffer, gain: number, loop = false): AudioBufferSourceNode {
  const c = ctx();
  const src = c.createBufferSource();
  src.buffer = buffer;
  src.loop = loop;
  const g = c.createGain();
  g.gain.value = gain;
  src.connect(g);
  g.connect(c.destination);
  src.start();
  return src;
}

export function sfx(name: SfxName): void {
  try {
    if (!store().on) return;
    const { url, gain } = SFX[name];
    const c = ctx();
    loadBuffer(url).then((buf) => {
      if (!store().on) return;
      if (c.state === 'suspended') {
        // Never schedule one-shots into a suspended context (they would pile
        // up and fire stale); resume first — rejects harmlessly pre-gesture.
        c.resume().then(() => playBuffer(buf, gain)).catch(() => {});
        return;
      }
      playBuffer(buf, gain);
    }).catch(() => {});
  } catch { /* audio unavailable */ }
}

export function startMusic(): void {
  try {
    const s = store();
    if (!s.on || s.musicSrc) return;
    loadBuffer(MUSIC_URL).then((buf) => {
      const s2 = store();
      if (!s2.on || s2.musicSrc) return;
      // Unlike one-shots, starting a loop into a suspended context is what we
      // want: it begins the instant autoplay is granted or a gesture resumes.
      s2.musicSrc = playBuffer(buf, MUSIC_GAIN, true);
      ctx().resume().catch(() => {});
    }).catch(() => {});
  } catch { /* audio unavailable */ }
}

export function stopMusic(): void {
  const s = store();
  try { s.musicSrc?.stop(); } catch { /* already stopped */ }
  s.musicSrc = undefined;
}

// Browsers keep an AudioContext suspended until the page gets a real user
// gesture. Bind a one-time unlock to the very first pointer/key gesture
// (the boot LAUNCH click on the home page) so samples work right away.
function unlock(): void {
  try {
    const c = ctx();
    if (c.state === 'suspended') c.resume().catch(() => {});
    startMusic();
  } catch { /* audio unavailable */ }
}

function bindGlobal(): void {
  const s = store();
  if (!s.unlockBound) {
    s.unlockBound = true;
    window.addEventListener('pointerdown', unlock, { once: true, capture: true });
    window.addEventListener('keydown', unlock, { once: true, capture: true });
    // Try to start music immediately (allowed once the browser trusts the
    // origin); otherwise it starts on the unlock gesture above.
    startMusic();
  }
  if (!s.clickBound) {
    s.clickBound = true;
    window.addEventListener(
      'click',
      (e) => {
        const t = e.target as Element | null;
        const hit = t?.closest?.('a, button');
        if (hit && !hit.closest('[data-sfx-silent]')) sfx('click');
      },
      { capture: true },
    );
    // Prefetch the small, hot samples so the first hover/click isn't late.
    if (s.on) {
      (['hover', 'click', 'open', 'deny'] as const).forEach((n) => {
        loadBuffer(SFX[n].url).catch(() => {});
      });
    }
  }
}

if (typeof window !== 'undefined') bindGlobal();

export function soundOn(): boolean {
  return store().on;
}

export function setSound(on: boolean): void {
  store().on = on;
  try { sessionStorage.setItem('rm-sound', on ? 'on' : 'off'); } catch { /* private mode */ }
  if (on) {
    blip(880, 0.05); // confirm blip on enable
    startMusic();
  } else {
    stopMusic();
  }
}

function play(ctx2: AudioContext, freq: number, gain: number): void {
  const osc = ctx2.createOscillator();
  const g = ctx2.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  g.gain.setValueAtTime(gain, ctx2.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx2.currentTime + 0.08);
  osc.connect(g);
  g.connect(ctx2.destination);
  osc.start();
  osc.stop(ctx2.currentTime + 0.09);
}

export function blip(freq: number, gain: number): void {
  try {
    const c = ctx();
    if (c.state === 'suspended') {
      c.resume().then(() => play(c, freq, gain)).catch(() => {});
      return;
    }
    play(c, freq, gain);
  } catch { /* audio unavailable */ }
}
