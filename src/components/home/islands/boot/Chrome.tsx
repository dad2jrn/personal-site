import { MicroSelectRow, StatusDots } from './Greebles';
import { MICRO_SELECT_SEED } from './data';

export function HeaderBand({ reduced, showSkipHint }: { reduced: boolean; showSkipHint: boolean }) {
  const [a, b] = MICRO_SELECT_SEED;
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 font-mono text-[13px] tracking-[0.18em] text-ink/85">
          <span className="text-accent">&#9660;</span>
          <span>
            RM SERVER ACCESS | <span className="text-accent">OPERATOR CONSOLE</span>
          </span>
        </div>
        <div className="relative mt-3 h-px w-[480px] max-w-full bg-ink/[0.14]">
          <span className="absolute -left-[2px] -top-[2px] h-[5px] w-[5px] bg-ink" />
          <span className="absolute -right-[2px] -top-[2px] h-[5px] w-[5px] bg-ink" />
        </div>
      </div>
      <div className="hidden flex-col items-end gap-2 min-[1100px]:flex">
        <MicroSelectRow code={a.code} period={a.period} reduced={reduced} />
        <MicroSelectRow code={b.code} period={b.period} reduced={reduced} />
        {showSkipHint && (
          <div className="mt-1 font-mono text-[8px] tracking-[0.1em] text-ink/30">PRESS ANY KEY TO SKIP</div>
        )}
      </div>
    </div>
  );
}

export function Footer({ reduced, suffix }: { reduced: boolean; suffix: boolean }) {
  return (
    <div className="border-t border-ink/[0.14] pt-4">
      <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] tracking-[0.1em] text-ink/45">
        <div className="flex items-center gap-3">
          <StatusDots reduced={reduced} />
          <span>TTY/0 :: RM FIELD-STATION</span>
        </div>
        <div>
          <span className="text-accent">SESSION RM97-2607</span>
          {suffix && <span> &middot; STANDING BY</span>}
        </div>
      </div>
    </div>
  );
}
