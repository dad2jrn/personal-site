import { useEffect, useRef, useState } from 'react';
import { CornerHandles } from './Greebles';
import { SEQ_ROWS, TRANSMISSION_LINES } from './data';
import { sfx } from '../../../../scripts/sound';
import type { CareerItem, PatentChipData, NavItem } from './types';

const SEQ_GLYPHS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
const randCode = () =>
  Array.from({ length: 3 }, () => SEQ_GLYPHS[Math.floor(Math.random() * SEQ_GLYPHS.length)]).join('');

// SEQ scrubbers: on load each slider sweeps its track and the row's 3-char
// code cycles randomly. Grab a slider and drag — the code scrambles as you
// scrub — and wherever you release it, the thumb and code stay set. Pure
// toy: nothing reads the value.
export function SeqRows({ reduced }: { reduced: boolean }) {
  const [rows, setRows] = useState(() => SEQ_ROWS.map((r) => ({ code: r.code, set: false, pos: 0.7 })));
  const trackRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const dragging = useRef<number | null>(null);
  const lastX = useRef(0);

  // Codes keep rolling until a row is set by the visitor.
  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => {
      setRows((rs) => (rs.some((r) => !r.set) ? rs.map((r) => (r.set ? r : { ...r, code: randCode() })) : rs));
    }, 380);
    return () => clearInterval(id);
  }, [reduced]);

  const posFrom = (i: number, clientX: number): number => {
    const track = trackRefs.current[i];
    if (!track) return 0;
    const r = track.getBoundingClientRect();
    return Math.min(1, Math.max(0, (clientX - r.left) / r.width));
  };

  const onPointerDown = (i: number) => (e: React.PointerEvent<HTMLSpanElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragging.current = i;
    lastX.current = e.clientX;
    const pos = posFrom(i, e.clientX);
    setRows((rs) => rs.map((r, j) => (j === i ? { ...r, set: true, pos, code: randCode() } : r)));
  };

  const onPointerMove = (i: number) => (e: React.PointerEvent<HTMLSpanElement>) => {
    if (dragging.current !== i) return;
    const pos = posFrom(i, e.clientX);
    const scramble = Math.abs(e.clientX - lastX.current) > 4;
    if (scramble) lastX.current = e.clientX;
    setRows((rs) => rs.map((r, j) => (j === i ? { ...r, pos, code: scramble ? randCode() : r.code } : r)));
  };

  const onPointerUp = () => {
    dragging.current = null;
  };

  return (
    <div className="flex flex-col gap-3">
      {SEQ_ROWS.map((row, i) => (
        <div key={i} className="flex items-center gap-3 font-mono text-[10px] tracking-[0.1em]">
          <span className="w-[30px] text-ink/40" aria-hidden="true">{row.label}</span>
          <span className="w-[170px] shrink-0 border border-ink/20 px-2 py-1 text-ink/70" aria-hidden="true">
            {row.value} <span className="text-accent">&#9660;</span> <span className="text-accent/80">{rows[i].code}</span>
          </span>
          <span
            ref={(el) => { trackRefs.current[i] = el; }}
            role="presentation"
            onPointerDown={onPointerDown(i)}
            onPointerMove={onPointerMove(i)}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            className="relative h-[3px] flex-1 cursor-ew-resize touch-none bg-ink/[0.14] py-0 before:absolute before:-inset-y-2 before:inset-x-0 before:content-['']"
          >
            <span
              className="pointer-events-none absolute -top-[4.5px] h-3 w-3 bg-accent"
              style={
                rows[i].set
                  ? { left: `calc((100% - 12px) * ${rows[i].pos})` }
                  : reduced
                    ? { left: 'calc((100% - 12px) * 0.7)' }
                    : { animation: `rm-slide-track ${2.7 + i * 0.4}s ease-in-out infinite alternate` }
              }
            />
          </span>
        </div>
      ))}
    </div>
  );
}

// Sealed-module accordion: the modules never navigate — expanding one plays
// the deny sample and reveals an ACCESS DENIED readout that points the
// visitor at the LAUNCH button instead. Single-open.
export function NavModules({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const toggle = (i: number) => {
    setOpen((cur) => {
      const next = cur === i ? null : i;
      if (next !== null) sfx('deny');
      return next;
    });
  };
  return (
    <div className="flex flex-col gap-2">
      {items.map((item, i) => (
        <div key={item.label} className="border border-accent/25 bg-accent/[0.09] transition-colors hover:border-accent">
          <button
            type="button"
            data-sfx-silent
            aria-expanded={open === i}
            onClick={() => toggle(i)}
            className="group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/20"
          >
            <span className="flex gap-[2px]" aria-hidden="true">
              <span className="h-[14px] w-[3px] bg-accent" />
              <span className="h-[14px] w-[3px] bg-accent" />
              <span className="h-[14px] w-[3px] bg-accent" />
            </span>
            <span className="font-mono text-[12px] tracking-[0.16em] text-ink">{item.label}</span>
            <span
              className={`ml-auto text-accent transition-transform duration-200 ${open === i ? 'rotate-90' : ''}`}
              aria-hidden="true"
            >
              &#9654;
            </span>
          </button>
          <div
            className={`grid transition-[grid-template-rows] duration-300 ease-out ${open === i ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
          >
            {/* Lines stay mounted so the close transition can animate; the
                entrance animation is only applied while open, so it replays
                each time the panel expands. */}
            <div className="min-h-0 overflow-hidden">
              <div className="border-t border-accent/25 px-4 py-3 font-mono text-[11px] leading-[1.9] tracking-[0.1em]">
                <div className="text-accent" style={open === i ? { animation: 'rm-bootline 0.25s both' } : { opacity: 0 }}>
                  &gt; ACCESS DENIED :: CLEARANCE_REQUIRED
                </div>
                <div className="text-ink/60" style={open === i ? { animation: 'rm-bootline 0.25s both 0.15s' } : { opacity: 0 }}>
                  &gt; {item.module} SEALED &mdash; ERR {item.err}
                </div>
                <div className="text-ink/85" style={open === i ? { animation: 'rm-bootline 0.25s both 0.3s' } : { opacity: 0 }}>
                  &gt; LAUNCH APPLICATION TO AUTHENTICATE
                  <span className="ml-[6px] inline-block h-[11px] w-[7px] translate-y-[1px] animate-[rm-blink_0.9s_infinite] bg-accent" aria-hidden="true" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CareerBars({ items, reduced }: { items: CareerItem[]; reduced: boolean }) {
  return (
    <div>
      <div className="mb-3 font-mono text-[9px] tracking-[0.12em] text-ink/45">LOADING /CAREER</div>
      <div className="flex flex-col gap-3">
        {items.map((c) => (
          <div key={c.code} aria-hidden="true">
            <div className="mb-1 flex justify-between font-mono text-[9px] tracking-[0.08em] text-ink/50">
              <span>{c.code}</span>
              <span>{c.year}</span>
            </div>
            <div className="h-[3px] w-full bg-ink/[0.12]">
              <div
                className="h-full origin-left bg-accent"
                style={{
                  width: `${c.pct}%`,
                  ...(reduced ? {} : { animation: `rm-fillx 0.9s cubic-bezier(0.16,1,0.3,1) ${c.delay}s both` }),
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PatentChips({ items }: { items: PatentChipData[] }) {
  return (
    <div>
      <div className="mb-3 font-mono text-[9px] tracking-[0.12em] text-ink/45">PATENT REGISTRY &middot; USPTO</div>
      <div className="grid grid-cols-2 gap-2">
        {items.map((p) => (
          <div key={p.number} aria-hidden="true" className="border border-accent/25 px-2 py-2 text-center">
            <div className="font-mono text-[9px] text-accent">{p.number}</div>
            <div className="mt-1 font-mono text-[8px] tracking-[0.1em] text-ink/40">GRANTED</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TransmissionWindow({ reduced }: { reduced: boolean }) {
  const lines = [...TRANSMISSION_LINES, ...TRANSMISSION_LINES];
  return (
    <div aria-hidden="true" className="relative overflow-hidden border border-ink/20 p-3">
      <CornerHandles />
      <div className="mb-2 font-mono text-[8px] tracking-[0.1em] text-ink/40">RM TRANSMISSION &middot; RAW</div>
      <div className="relative h-[120px] overflow-hidden">
        <div
          className="absolute inset-x-0 top-0 flex flex-col gap-[3px]"
          style={reduced ? undefined : { animation: 'rm-scrolly 9s linear infinite' }}
        >
          {lines.map((l, i) => (
            <div key={i} className="font-mono text-[8.5px] text-accent/45">
              {l}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
