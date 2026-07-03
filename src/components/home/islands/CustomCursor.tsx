import { useEffect, useRef, useState } from 'react';
import { sfx } from '../../../scripts/sound';

// Desktop-only custom cursor: 6px dot tracks exactly; 30px ring lerps behind
// and grows to 52px over links/buttons. Native cursor hidden only while mounted.
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setActive(true);
  }, []);

  useEffect(() => {
    if (!active) return;
    const styleEl = document.createElement('style');
    styleEl.textContent = '* { cursor: none !important; }';
    document.head.appendChild(styleEl);

    let mx = -100, my = -100, rx = -100, ry = -100, raf = 0;
    let prevHot: Element | null = null;
    const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
    const onOver = (e: MouseEvent) => {
      const target = e.target as Element;
      const hot = target.closest?.('a, button') ?? null;
      const ring = ringRef.current;
      if (ring) {
        ring.style.width = hot ? '52px' : '30px';
        ring.style.height = hot ? '52px' : '30px';
      }
      if (hot && hot !== prevHot) sfx('hover');
      prevHot = hot;
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseover', onOver, { passive: true });

    const loop = () => {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      const dot = dotRef.current;
      const ring = ringRef.current;
      if (dot) dot.style.transform = `translate(${mx - 3}px, ${my - 3}px)`;
      if (ring) {
        const s = parseFloat(ring.style.width) || 30;
        ring.style.transform = `translate(${rx - s / 2}px, ${ry - s / 2}px)`;
      }
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      styleEl.remove();
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
      cancelAnimationFrame(raf);
    };
  }, [active]);

  if (!active) return null;
  return (
    <>
      <div ref={dotRef} className="pointer-events-none fixed left-0 top-0 z-[200] h-[6px] w-[6px] rounded-full bg-accent mix-blend-difference" style={{ transform: 'translate(-100px, -100px)' }} />
      <div ref={ringRef} className="pointer-events-none fixed left-0 top-0 z-[200] h-[30px] w-[30px] rounded-full border border-accent opacity-60 mix-blend-difference [transition:width_0.2s,height_0.2s]" style={{ transform: 'translate(-100px, -100px)', width: '30px', height: '30px' }} />
    </>
  );
}
