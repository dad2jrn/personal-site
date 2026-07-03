import { CornerHandles } from './Greebles';
import { SEQ_ROWS, TRANSMISSION_LINES } from './data';
import type { CareerItem, PatentChipData, NavItem } from './types';

export function SeqRows({ reduced }: { reduced: boolean }) {
  return (
    <div className="flex flex-col gap-3">
      {SEQ_ROWS.map((row, i) => (
        <div key={i} aria-hidden="true" className="flex items-center gap-3 font-mono text-[10px] tracking-[0.1em]">
          <span className="w-[30px] text-ink/40">{row.label}</span>
          <span className="flex-1 border border-ink/20 px-2 py-1 text-ink/70">
            {row.value} <span className="text-accent">&#9660;</span> <span className="text-accent/80">{row.code}</span>
          </span>
          <span className="relative h-[3px] w-[46px] bg-ink/[0.14]">
            <span
              className="absolute -top-[4.5px] left-0 h-3 w-3 bg-accent"
              style={
                reduced
                  ? { transform: 'translateX(34px)' }
                  : { animation: `rm-slidex ${2.7 + i * 0.4}s ease-in-out infinite alternate` }
              }
            />
          </span>
        </div>
      ))}
    </div>
  );
}

export function NavModules({ items }: { items: NavItem[] }) {
  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <a
          key={item.href}
          href={item.href}
          data-nav-module
          data-sfx-silent
          className="group flex items-center gap-3 border border-accent/25 bg-accent/[0.09] px-4 py-3 no-underline transition-colors hover:border-accent hover:bg-accent/20"
        >
          <span className="flex gap-[2px]" aria-hidden="true">
            <span className="h-[14px] w-[3px] bg-accent" />
            <span className="h-[14px] w-[3px] bg-accent" />
            <span className="h-[14px] w-[3px] bg-accent" />
          </span>
          <span className="font-mono text-[12px] tracking-[0.16em] text-ink">{item.label}</span>
          <span className="ml-auto text-accent">&#9654;</span>
        </a>
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
