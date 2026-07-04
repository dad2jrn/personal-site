// WebAudio engine: sampled UI sounds + looping music tracks + legacy sine
// blips. On by default; the nav toggle flips it. State lives on window so
// every bundle (Astro scripts, React islands) shares it; the ON flag persists
// across page loads in sessionStorage.

export type SfxName = 'hover' | 'click' | 'open' | 'deny' | 'boot' | 'launch' | 'type';
export type MusicName = 'boot' | 'main';

type RMSound = {
  on: boolean;
  ctx?: AudioContext;
  unlockBound?: boolean;
  clickBound?: boolean;
  gestured?: boolean;
  buffers?: Map<string, Promise<AudioBuffer>>;
  musicSrc?: AudioBufferSourceNode;
  musicName?: MusicName;
  // Loop-position bookkeeping so navigation doesn't restart the track:
  // where in the buffer this playback started, when (in ctx time), and the
  // buffer's duration. Persisted to sessionStorage on pagehide.
  musicStartOffset?: number;
  musicStartTime?: number;
  musicDur?: number;
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

const MUSIC: Record<MusicName, { url: string; gain: number }> = {
  boot: { url: '/sounds/musicLoop.ogg', gain: 0.25 },
  main: { url: '/sounds/mainLoop.ogg', gain: 0.25 },
};

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
    p = fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`fetch ${url}: ${r.status}`);
        return r.arrayBuffer();
      })
      .then((data) => ctx().decodeAudioData(data));
    // Evict failures so a transient error doesn't silence the sample all session.
    p.catch(() => { s.buffers?.delete(url); });
    s.buffers.set(url, p);
  }
  return p;
}

function playBuffer(buffer: AudioBuffer, gain: number, loop = false, offset = 0): AudioBufferSourceNode {
  const c = ctx();
  const src = c.createBufferSource();
  src.buffer = buffer;
  src.loop = loop;
  const g = c.createGain();
  g.gain.value = gain;
  src.connect(g);
  g.connect(c.destination);
  src.start(0, offset);
  return src;
}

// The music loop behaves like a radio station: its position is saved on
// pagehide and, on the next page, resumed as if it had kept playing during
// the navigation (wall-clock adjusted), instead of restarting from zero.
function saveMusicPos(): void {
  try {
    const s = store();
    if (!s.musicSrc || !s.musicName || !s.musicDur) return;
    const elapsed = Math.max(0, (s.ctx?.currentTime ?? 0) - (s.musicStartTime ?? 0));
    const offset = ((s.musicStartOffset ?? 0) + elapsed) % s.musicDur;
    sessionStorage.setItem('rm-music-pos', JSON.stringify({ n: s.musicName, o: offset, t: Date.now() }));
  } catch { /* private mode / audio unavailable */ }
}

function savedOffset(track: MusicName, duration: number): number {
  try {
    const raw = sessionStorage.getItem('rm-music-pos');
    if (!raw || duration <= 0) return 0;
    const p = JSON.parse(raw) as { n: string; o: number; t: number };
    if (p.n !== track || typeof p.o !== 'number' || typeof p.t !== 'number') return 0;
    return (p.o + (Date.now() - p.t) / 1000) % duration;
  } catch {
    return 0;
  }
}

export function sfx(name: SfxName): void {
  try {
    if (!store().on) return;
    const { url, gain } = SFX[name];
    const c = ctx();
    loadBuffer(url).then((buf) => {
      if (!store().on) return;
      if (c.state === 'suspended') {
        // Pre-gesture, resume() stays pending (it does not reject) and any
        // queued one-shot would burst out later on the unlock click — drop it.
        if (!store().gestured) return;
        c.resume().then(() => { if (store().on) playBuffer(buf, gain); }).catch(() => {});
        return;
      }
      playBuffer(buf, gain);
    }).catch(() => {});
  } catch { /* audio unavailable */ }
}

// While the boot overlay is up the page plays its intro loop; everywhere
// else — and once the overlay starts its dismiss fade (opacity 0) — the
// main site loop plays.
function currentTrack(): MusicName {
  const el = document.getElementById('boot-overlay');
  return el && el.style.opacity !== '0' ? 'boot' : 'main';
}

export function startMusic(name?: MusicName): void {
  try {
    const s = store();
    if (!s.on) return;
    const track = name ?? currentTrack();
    if (s.musicSrc && s.musicName === track) return;
    stopMusic(); // switching tracks ends the old loop immediately
    s.musicName = track;
    const { url, gain } = MUSIC[track];
    loadBuffer(url).then((buf) => {
      const s2 = store();
      // Abandon if sound went off, another track was requested meanwhile,
      // or a concurrent call already started this one.
      if (!s2.on || s2.musicName !== track || s2.musicSrc) return;
      // Unlike one-shots, starting a loop into a suspended context is what we
      // want: it begins the instant autoplay is granted or a gesture resumes.
      const offset = savedOffset(track, buf.duration);
      s2.musicSrc = playBuffer(buf, gain, true, offset);
      s2.musicStartOffset = offset;
      s2.musicStartTime = s2.ctx?.currentTime ?? 0;
      s2.musicDur = buf.duration;
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
    store().gestured = true;
    const c = ctx();
    if (c.state === 'suspended') c.resume().catch(() => {});
    startMusic();
  } catch { /* audio unavailable */ }
}

// Prefetch the small, hot samples so the first hover/click isn't late.
function prefetchHot(): void {
  (['hover', 'click', 'open', 'deny'] as const).forEach((n) => {
    loadBuffer(SFX[n].url).catch(() => {});
  });
}

function bindGlobal(): void {
  const s = store();
  if (!s.unlockBound) {
    s.unlockBound = true;
    window.addEventListener('pointerdown', unlock, { once: true, capture: true });
    window.addEventListener('keydown', unlock, { once: true, capture: true });
    // Persist the loop position when leaving so the next page resumes the
    // track mid-stream instead of restarting it.
    window.addEventListener('pagehide', saveMusicPos);
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
    if (s.on) prefetchHot();
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
    prefetchHot();
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
