import { useState } from 'react';
import { CornerHandles } from './Greebles';

interface Tick {
  h: number;
  dur: number;
  delay: number;
}

export function SystemBox({ connection, clock, reduced }: { connection: number; clock: string; reduced: boolean }) {
  // Generated once, client-side only (useState lazy initializer) — avoids
  // SSR/CSR hydration mismatches from Math.random() at module/render scope.
  const [ticks] = useState<Tick[]>(() =>
    Array.from({ length: 38 }, () => ({
      h: 6 + Math.round(Math.random() * 16),
      dur: 0.4 + Math.random() * 1.2,
      delay: Math.random() * 1.6,
    })),
  );

  return (
    <div className="relative border border-ink/20 p-6">
      <CornerHandles />
      <div className="flex flex-wrap items-center gap-6">
        <div className="relative flex h-[54px] w-[54px] shrink-0 items-center justify-center">
          {!reduced && (
            <span
              aria-hidden="true"
              className="absolute inset-[-6px] rounded-full border border-dashed border-accent/60"
              style={{ animation: 'rm-rot 14s linear infinite' }}
            />
          )}
          <span className="flex h-full w-full items-center justify-center rounded-full border border-accent font-mono text-[15px] font-black text-accent">
            RM
          </span>
        </div>
        <div className="min-w-[140px] flex-1">
          <div className="font-mono text-[11px] tracking-[0.12em] text-ink/80">
            SYSTEM &middot; <span className="text-accent">ACTIVE</span>
          </div>
          <div className="mt-1 font-mono text-[10px] tracking-[0.1em] text-ink/45">
            CONNECTION {connection.toLocaleString()}
          </div>
        </div>
        <div className="flex h-[22px] items-end gap-[2px]" aria-hidden="true">
          {ticks.map((t, i) => (
            <span
              key={i}
              className="w-[3px] bg-accent/70"
              style={{
                height: `${t.h}px`,
                opacity: reduced ? 0.6 : undefined,
                animation: reduced ? undefined : `rm-flicker ${t.dur}s steps(2) infinite ${t.delay}s`,
              }}
            />
          ))}
        </div>
        <div className="text-right">
          <div className="font-mono text-[9px] tracking-[0.1em] text-ink/40">SERVER TIME</div>
          <div className="font-mono text-[15px] text-accent">{clock}</div>
          <div className="mt-1 font-mono text-[9px] tracking-[0.1em] text-ink/40">ENCRYPT &middot; 981</div>
        </div>
      </div>
    </div>
  );
}
