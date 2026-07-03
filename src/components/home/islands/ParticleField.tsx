import { useEffect, useRef } from 'react';

const ACCENT = '245,165,36';
const N = 110; // ~40% more than the prototype's 80 (revision feedback #6)
const LINK_DIST = 130;
// Visibility bumped over the prototype (0.22 / 2px / 0.7) per spec — clearer, not overbearing.
const LINE_ALPHA = 0.32;
const DOT_SIZE = 2.5;
const DOT_ALPHA = 0.85;
const SPEED = 0.525; // prototype 0.35 × 1.5 (revision feedback #6)
// Mouse interaction: the cursor acts as an extra node — nearby particles tether
// to it with amber lines, and the closest ones are gently pushed aside.
const CURSOR_LINK = 160;   // px — tether radius
const CURSOR_LINE_ALPHA = 0.5; // tethers slightly brighter than particle links
const REPULSE_R = 90;      // px — inner radius where particles part around the cursor
const REPULSE_F = 2.2;     // max positional push per frame (px)

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let raf = 0;
    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * devicePixelRatio;
      canvas.height = h * devicePixelRatio;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const mouse = { x: -9999, y: -9999 };
    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);

    const pts = Array.from({ length: N }, () => ({
      x: Math.random() * 2000,
      y: Math.random() * 1200,
      vx: (Math.random() - 0.5) * SPEED,
      vy: (Math.random() - 0.5) * SPEED,
    }));

    const draw = () => {
      raf = requestAnimationFrame(draw);
      if (document.hidden) return; // pause when tab hidden
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        p.x = Math.max(0, Math.min(w, p.x));
        p.y = Math.max(0, Math.min(h, p.y));
      }
      ctx.lineWidth = 1;
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK_DIST * LINK_DIST) {
            const a = (1 - Math.sqrt(d2) / LINK_DIST) * LINE_ALPHA;
            ctx.strokeStyle = `rgba(${ACCENT},${a})`;
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }
      }
      // Cursor as node: tether nearby particles, part the closest ones.
      // Positional push (not a velocity kick) so speeds stay bounded.
      const mx = mouse.x;
      const my = mouse.y;
      if (mx >= 0 && mx <= w && my >= 0 && my <= h) {
        for (const p of pts) {
          const dx = p.x - mx;
          const dy = p.y - my;
          const d = Math.hypot(dx, dy);
          if (d < CURSOR_LINK && d > 0.001) {
            const a = (1 - d / CURSOR_LINK) * CURSOR_LINE_ALPHA;
            ctx.strokeStyle = `rgba(${ACCENT},${a})`;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mx, my);
            ctx.stroke();
            if (d < REPULSE_R) {
              const f = Math.pow(1 - d / REPULSE_R, 2) * REPULSE_F;
              p.x = Math.max(0, Math.min(w, p.x + (dx / d) * f));
              p.y = Math.max(0, Math.min(h, p.y + (dy / d) * f));
            }
          }
        }
      }
      ctx.fillStyle = `rgba(${ACCENT},${DOT_ALPHA})`;
      for (const p of pts) {
        ctx.fillRect(p.x - DOT_SIZE / 2, p.y - DOT_SIZE / 2, DOT_SIZE, DOT_SIZE);
      }
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />;
}
