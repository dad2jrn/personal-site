import { useEffect, useRef, useState } from 'react';
import { useBootTimeline } from './boot/useBootTimeline';
import { HeaderBand, Footer } from './boot/Chrome';
import { MicroSelectRow, ArrayChip, SyncWidget, NineDWidget, LockBox } from './boot/Greebles';
import { SystemBox } from './boot/SystemBox';
import { SeqRows, NavModules, CareerBars, PatentChips, TransmissionWindow } from './boot/Panels';
import { MICRO_SELECT_SEED, ARRAY_CHIPS, CAREER_ITEMS, PATENT_CHIPS, NAV_ITEMS, SUBTITLE } from './boot/data';
import { sfx, startMusic } from '../../../scripts/sound';
import { initCornerFlicker } from '../../../scripts/flicker';

// Entrance delays (seconds) — every element uses rm-bootline 0.3s both {delay};
// these are the delays from bootoverlay.md §5, condensed to per-region values.
const ENTRANCE = {
  header: 0.1,
  leftRail: 0.5,
  system: 0.5,
  seq: 0.9,
  nav: 1.4,
  career: 0.6,
  patents: 0.9,
  sync: 1.4,
  locks: 1.5,
  transmission: 1.2,
  footer: 0.8,
} as const;

// Tablet/desktop only — matches the project's existing Tailwind `md:` breakpoint.
// Phone-width visitors keep the classic terminal overlay (see BootOverlay.astro).
const DESKTOP_QUERY = '(min-width: 768px)';

export default function BootConsole() {
  // Starts `false` so server render and first client paint agree (no
  // hydration mismatch) — flips to `true` a tick after mount if this is a
  // tablet/desktop viewport. All of BootConsoleInner's timers/sound/effects
  // stay unmounted until then, so phone visitors never run any of this.
  // Once per session: after a LAUNCH click (rm-boot-seen, shared with the
  // phone overlay) the gate never mounts again, so visitors returning from
  // inner pages land straight on the site. Dev override: /?boot forces the
  // gate regardless of the session flag.
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const force = new URLSearchParams(window.location.search).has('boot');
    let seen = false;
    try { seen = sessionStorage.getItem('rm-boot-seen') === '1'; } catch { /* private mode */ }
    setEnabled((force || !seen) && window.matchMedia(DESKTOP_QUERY).matches);
  }, []);
  if (!enabled) return null;
  return <BootConsoleInner />;
}

export function BootConsoleInner() {
  const t = useBootTimeline();
  const rootRef = useRef<HTMLDivElement>(null);
  const bootedRef = useRef(false);

  useEffect(() => {
    if (!bootedRef.current) {
      sfx('boot');
      bootedRef.current = true;
    }
    // Corner squares (header band ends, sync widget, lock boxes) flicker
    // sparsely — same scheduler as the resume panel and The Record.
    initCornerFlicker();
  }, []);

  useEffect(() => {
    if (!t.dismissed) return;
    const root = rootRef.current;
    if (!root) return;
    // animationend bubbles — a child's own entrance animation (e.g. the
    // payoff button's rm-stamp, if it mounts mid-dismiss via the skip
    // listener) can otherwise fire this before the exit collapse finishes.
    const onEnd = (e: AnimationEvent) => {
      if (e.animationName === 'rm-boot-exit') root.remove();
    };
    root.addEventListener('animationend', onEnd);
    root.classList.add('boot-overlay-exit');
    return () => root.removeEventListener('animationend', onEnd);
  }, [t.dismissed]);

  const enter = (key: keyof typeof ENTRANCE) => (t.reduced ? undefined : { animation: `rm-bootline 0.3s both ${ENTRANCE[key]}s` });

  const handleLaunch = () => {
    sfx('launch');
    startMusic('main');
    window.dispatchEvent(new Event('rm:boot-flash')); // BootFlash island flares over the exit
    t.dismiss();
  };

  return (
    <div
      ref={rootRef}
      role="status"
      aria-label="Site loading"
      data-sfx-silent
      data-flicker
      className="fixed inset-0 z-[150] overflow-hidden bg-surface-sunken text-ink"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: 'radial-gradient(rgba(237,235,230,0.06) 1px, transparent 1px)', backgroundSize: '26px 26px' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          backgroundImage:
            'repeating-linear-gradient(rgba(237,235,230,0.02) 0px, rgba(237,235,230,0.02) 1px, transparent 1px, transparent 3px)',
        }}
      />

      <div className="relative z-20 flex h-full flex-col justify-between gap-6 p-6 md:p-10">
        <div className="hidden min-[700px]:block" style={enter('header')}>
          <HeaderBand reduced={t.reduced} showSkipHint={t.phase !== 'ready'} />
        </div>

        <div className="flex flex-1 items-center gap-10 overflow-hidden">
          <div className="hidden w-[148px] shrink-0 flex-col gap-3 min-[1100px]:flex" style={enter('leftRail')}>
            {MICRO_SELECT_SEED.slice(2).map((m) => (
              <MicroSelectRow key={m.code} code={m.code} period={m.period} reduced={t.reduced} />
            ))}
            <div className="mt-2 flex flex-col gap-2">
              {ARRAY_CHIPS.map((c) => (
                <ArrayChip key={c.code} tag={c.tag} code={c.code} />
              ))}
            </div>
            <div style={enter('sync')}>
              <SyncWidget reduced={t.reduced} />
            </div>
            <NineDWidget reduced={t.reduced} />
          </div>

          <div className="mx-auto flex w-full max-w-[660px] flex-1 flex-col gap-6 max-[699px]:mx-auto max-[699px]:max-w-[420px] max-[699px]:items-center max-[699px]:text-center">
            <div className="hidden min-[700px]:block" style={enter('system')}>
              <SystemBox connection={t.connection} clock={t.clock} reduced={t.reduced} />
            </div>
            <div className="hidden min-[700px]:block" style={enter('seq')}>
              <SeqRows reduced={t.reduced} />
            </div>
            <div className="hidden min-[700px]:block" style={enter('nav')}>
              <NavModules items={NAV_ITEMS} />
            </div>
            <div className="min-h-[140px] whitespace-pre font-mono text-[12px] leading-[1.95] text-ink/[0.78]">
              {t.logLines.map((line, i) => (
                <div key={i} className={line.color === 'accent' ? 'text-accent' : line.color === 'dim' ? 'text-ink/50' : ''}>
                  {line.text}
                </div>
              ))}
            </div>
            {t.buttonVisible && (
              <button
                type="button"
                autoFocus
                data-sfx-silent
                onClick={handleLaunch}
                className="inline-flex w-fit items-center gap-3 bg-accent px-8 py-[18px] font-mono text-[15px] font-bold tracking-[0.16em] text-surface shadow-[0_0_40px_rgba(245,165,36,0.25)] transition-[transform,box-shadow] duration-200 hover:-translate-y-[3px] hover:shadow-[0_8px_50px_rgba(245,165,36,0.4)]"
                style={t.reduced ? undefined : { animation: 'rm-stamp 0.35s both' }}
              >
                {t.buttonLabel}
                <span className="text-[13px]">&#9654;</span>
              </button>
            )}
            {t.subtitleVisible && <div className="font-mono text-[11px] tracking-[0.12em] text-ink/45">{SUBTITLE}</div>}
          </div>

          <div className="hidden w-[300px] shrink-0 flex-col gap-6 min-[1100px]:flex">
            <div className="font-mono text-[9px] tracking-[0.12em] text-ink/40">CARRIER WAVE</div>
            <div style={enter('career')}>
              <CareerBars items={CAREER_ITEMS} reduced={t.reduced} />
            </div>
            <div style={enter('patents')}>
              <PatentChips items={PATENT_CHIPS} />
            </div>
            <div style={enter('transmission')}>
              <TransmissionWindow reduced={t.reduced} />
            </div>
            <div className="flex flex-col gap-2" style={enter('locks')}>
              <LockBox code="998A" />
              <LockBox code="220A" />
            </div>
          </div>
        </div>

        <div className="hidden min-[700px]:block" style={enter('footer')}>
          <Footer reduced={t.reduced} suffix={t.footerSuffix} />
        </div>
      </div>
    </div>
  );
}
