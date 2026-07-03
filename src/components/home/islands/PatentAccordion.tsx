import { Fragment, useState } from 'react';
import { sfx } from '../../../scripts/sound';

export interface PatentItem {
  number: string;
  title: string;
  desc: string;
  tags: string;
  href: string;
}

// Decorative schematic nodes: filled circle / rotated square / outlined circle / filled square
const NODES = [
  'h-[10px] w-[10px] rounded-full bg-accent',
  'h-[10px] w-[10px] rotate-45 border border-accent',
  'h-[10px] w-[10px] rounded-full border border-accent',
  'h-[10px] w-[10px] bg-accent',
];

export default function PatentAccordion({ items }: { items: PatentItem[] }) {
  const [open, setOpen] = useState(-1); // single-open accordion

  const toggle = (i: number) => {
    sfx(open === i ? 'deny' : 'open');
    setOpen(open === i ? -1 : i);
  };

  return (
    <div>
      {items.map((pat, i) => (
        <div key={pat.number} className="mb-4 overflow-hidden border border-line">
          <button
            type="button"
            data-sfx-silent
            onClick={() => toggle(i)}
            aria-expanded={open === i}
            className="grid w-full grid-cols-[1fr_40px] items-center gap-6 px-7 py-[26px] text-left transition-colors hover:bg-accent/[0.06] md:grid-cols-[170px_1fr_40px]"
          >
            <span className="font-mono text-[13px] text-accent">{pat.number}</span>
            <span className="hidden text-[clamp(18px,2.2vw,28px)] font-bold tracking-[-0.01em] [font-stretch:112%] md:block">{pat.title}</span>
            <span className="text-right font-mono text-[20px] text-ink/60">{open === i ? '−' : '+'}</span>
            <span className="col-span-2 text-[clamp(18px,2.2vw,28px)] font-bold tracking-[-0.01em] [font-stretch:112%] md:hidden">{pat.title}</span>
          </button>
          {open === i && (
            <div className="grid animate-[rm-fadeup_0.4s_both] grid-cols-1 items-center gap-12 px-7 pb-8 pt-2 md:grid-cols-[1fr_300px]">
              <div>
                <p className="mb-5 max-w-[620px] text-[16px] leading-[1.65] text-ink/70">{pat.desc}</p>
                <div className="mb-5 font-mono text-[11px] tracking-[0.1em] text-accent">{pat.tags}</div>
                <a href={pat.href} className="border-b border-accent pb-[3px] font-mono text-[12px] tracking-[0.12em] text-ink no-underline transition-colors hover:text-accent">VIEW PATENT DETAILS →</a>
              </div>
              <div className="hidden items-center justify-between px-2 md:flex">
                {NODES.map((cls, n) => (
                  <Fragment key={n}>
                    <span className={cls} style={{ animation: `rm-pulse 2s infinite ${n * 0.4}s` }} />
                    {n < NODES.length - 1 && (
                      <span
                        className="h-px flex-1"
                        style={{ background: 'repeating-linear-gradient(90deg, rgba(245,165,36,0.6) 0 6px, transparent 6px 12px)' }}
                      />
                    )}
                  </Fragment>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
