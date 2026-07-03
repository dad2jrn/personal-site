// Scroll reveals for [data-reveal]. Elements already in the first viewport
// are never hidden (no-JS safe: hidden state is only ever applied by JS).
export function initReveals(): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        const el = e.target as HTMLElement;
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
        io.unobserve(el);
      }
    }
  }, { threshold: 0.12 });
  els.forEach((el, i) => {
    if (el.getBoundingClientRect().top > window.innerHeight * 0.92) {
      const d = (i % 4) * 0.08;
      el.style.opacity = '0';
      el.style.transform = 'translateY(28px)';
      el.style.transition = `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${d}s, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${d}s`;
      io.observe(el);
    }
  });
}
