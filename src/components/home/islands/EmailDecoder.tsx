import { useEffect, useRef } from 'react';
import { sfx } from '../../../scripts/sound';

const CHARS = '#$%&@*+=?!<>/\\0123456789ABCDEF';

// Assembled at runtime so the address never appears in the page source.
function email(): string {
  return (
    [114, 111, 110, 109, 101, 99, 107].map((c) => String.fromCharCode(c)).join('') +
    String.fromCharCode(64) +
    [103, 109, 97, 105, 108].map((c) => String.fromCharCode(c)).join('') +
    '.com'
  );
}

export default function EmailDecoder() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const target = email();
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        if (reduced) { el.textContent = target; return; }
        sfx('type');
        const t0 = performance.now();
        const dur = 1200;
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / dur);
          const settled = Math.floor(target.length * p); // left-to-right settle
          let out = target.slice(0, settled);
          for (let i = settled; i < target.length; i++) {
            out += CHARS[Math.floor(Math.random() * CHARS.length)];
          }
          el.textContent = out;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <a
      href="#contact"
      onClick={(e) => {
        e.preventDefault();
        window.location.href = 'mai' + 'lto:' + email();
      }}
      className="inline-block border-b-2 border-accent pb-[6px] font-mono text-[clamp(16px,2.4vw,28px)] tracking-[0.04em] text-ink no-underline transition-colors hover:text-accent"
    >
      <span ref={ref}>r*******@*****.***</span>
    </a>
  );
}
