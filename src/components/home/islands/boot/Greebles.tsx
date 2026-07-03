export function CornerHandles() {
  return (
    <>
      <span aria-hidden="true" className="pointer-events-none absolute -left-[3px] -top-[3px] h-[5px] w-[5px] bg-ink" />
      <span aria-hidden="true" className="pointer-events-none absolute -right-[3px] -top-[3px] h-[5px] w-[5px] bg-ink" />
      <span aria-hidden="true" className="pointer-events-none absolute -bottom-[3px] -left-[3px] h-[5px] w-[5px] bg-ink" />
      <span aria-hidden="true" className="pointer-events-none absolute -bottom-[3px] -right-[3px] h-[5px] w-[5px] bg-ink" />
    </>
  );
}

export function MicroSelectRow({ code, period, reduced }: { code: string; period: number; reduced: boolean }) {
  return (
    <div aria-hidden="true" className="flex items-center gap-[6px] font-mono text-[8px] tracking-[0.12em] text-ink/40">
      <span className="h-[5px] w-[5px] border border-ink/40" />
      <span>{code}</span>
      <span className="text-accent">&#9660;</span>
      <span className="relative h-px w-[34px] bg-ink/[0.14]">
        <span
          className="absolute -top-[2px] left-0 h-[5px] w-[5px] bg-accent"
          style={reduced ? { transform: 'translateX(13px)' } : { animation: `rm-slidex ${period}s ease-in-out infinite alternate` }}
        />
      </span>
      <span>0</span>
    </div>
  );
}

export function ArrayChip({ tag, code }: { tag: string; code: string }) {
  return (
    <div aria-hidden="true" className="relative flex items-center gap-2 border border-ink/20 px-2 py-[6px]">
      <span className="absolute -left-1 -top-1 bg-accent px-[3px] font-mono text-[7px] font-bold text-surface">{tag}</span>
      <span className="flex h-4 w-4 items-center justify-center border border-ink/30 text-[9px] text-accent">&#9664;</span>
      <span className="font-mono text-[9px] tracking-[0.1em] text-ink/60">
        ARRAY <span className="text-accent/80">{code}</span>
      </span>
    </div>
  );
}

export function SyncWidget({ reduced }: { reduced: boolean }) {
  const periods = [1.8, 2.6, 2.2];
  return (
    <div aria-hidden="true" className="relative border border-ink/20 p-3">
      <CornerHandles />
      <div className="mb-2 font-mono text-[8px] tracking-[0.1em] text-accent">//SYNC</div>
      <div className="flex h-[54px] items-start justify-between gap-4 px-2">
        {periods.map((p, i) => (
          <div
            key={i}
            className="relative h-full w-px"
            style={{ background: 'repeating-linear-gradient(rgba(237,235,230,0.25) 0 3px, transparent 3px 6px)' }}
          >
            <span
              className="absolute left-1/2 top-0 h-[3px] w-[3px] -translate-x-1/2 rounded-full bg-accent"
              style={reduced ? undefined : { animation: `rm-fall ${p}s linear infinite` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 font-mono text-[8px] tracking-[0.08em] text-ink/40">DRIVE 6YT &middot; 998A</div>
    </div>
  );
}

export function NineDWidget({ reduced }: { reduced: boolean }) {
  return (
    <div aria-hidden="true" className="border border-ink/20 p-3">
      <div className="flex items-center justify-between font-mono text-[8px] tracking-[0.1em] text-ink/50">
        <span>9D</span>
        <span className="text-accent">&#9660;</span>
      </div>
      <div className="mt-1 font-mono text-[13px] text-ink/80">//A 44542</div>
      <div className="mt-2 flex gap-[6px]">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1 w-1 bg-accent"
            style={reduced ? { opacity: 1 } : { animation: `rm-boot-pulse 1.2s infinite ${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
}

export function LockBox({ code }: { code: string }) {
  return (
    <div aria-hidden="true" className="relative flex items-center justify-between border border-ink/20 px-3 py-2 font-mono text-[8px] tracking-[0.1em]">
      <CornerHandles />
      <span className="text-accent">// LOCK</span>
      <span className="text-ink/60">
        {code} <span className="text-accent">&#9660;</span>
      </span>
    </div>
  );
}

export function StatusDots({ reduced }: { reduced: boolean }) {
  return (
    <div aria-hidden="true" className="flex items-center gap-[6px]">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={i === 1 ? 'h-[6px] w-[6px] rounded-full bg-accent' : 'h-[6px] w-[6px] rounded-full bg-ink/30'}
          style={i === 1 && !reduced ? { animation: 'rm-boot-pulse 2s infinite' } : undefined}
        />
      ))}
    </div>
  );
}
