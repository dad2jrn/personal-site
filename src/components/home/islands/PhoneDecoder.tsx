import { useEffect, useRef } from 'react';
import { sfx } from '../../../scripts/sound';

const CHARS = '#$%&@*+=?!<>/\\0123456789ABCDEF';

// Assembled at runtime so the number never appears in the page source.
function phoneDigits(): string {
  return [43, 49, 56, 48, 52, 54, 57, 53, 52, 55, 52, 57].map((c) => String.fromCharCode(c)).join('');
}

function phoneDisplay(): string {
  const d = phoneDigits(); // "+18046954749"
  return `${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5, 8)} ${d.slice(8, 12)}`;
}

export default function PhoneDecoder() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const target = phoneDisplay();
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
            out += target[i] === ' ' ? ' ' : CHARS[Math.floor(Math.random() * CHARS.length)];
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
        window.location.href = 'tel:' + phoneDigits();
      }}
      className="text-ink/60 no-underline transition-colors hover:text-accent"
    >
      <span ref={ref}>+* *** *** ****</span>
    </a>
  );
}
