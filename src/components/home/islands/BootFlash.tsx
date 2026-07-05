import { useEffect, useState } from 'react';
import { NeuralNoise } from '../../ui/neural-noise';

const AMBER: [number, number, number] = [0.961, 0.647, 0.141];

// Amber birth-flash between the boot gate and the landing page. While the
// gate is up, the neural-noise shader is pre-mounted invisibly so WebGL is
// compiled and warm; on the rm:boot-flash event (dispatched by both boot
// variants' LAUNCH handlers) it flares to full amber over the dismissing
// overlay, holds a beat, and decays — the page underneath emerges from the
// noise. Skipped entirely under reduced motion or when the gate was skipped.
export default function BootFlash() {
  const [armed, setArmed] = useState(false); // shader mounted, invisible
  const [firing, setFiring] = useState(false); // flash sequence running

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let seen = false;
    try { seen = sessionStorage.getItem('rm-boot-seen') === '1'; } catch { /* private mode */ }
    const force = new URLSearchParams(window.location.search).has('boot');
    if (seen && !force) return; // no gate this session — nothing to flash
    setArmed(true);
    let timer = 0;
    const onFlash = () => {
      setFiring(true);
      timer = window.setTimeout(() => {
        setFiring(false);
        setArmed(false); // tear the shader down once the page is born
      }, 1900);
    };
    window.addEventListener('rm:boot-flash', onFlash, { once: true });
    return () => {
      window.removeEventListener('rm:boot-flash', onFlash);
      window.clearTimeout(timer);
    };
  }, []);

  if (!armed) return null;
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[190]"
      style={firing ? undefined : { opacity: 0 }}
    >
      <div
        className="absolute inset-0"
        style={firing ? { animation: 'rm-flash-noise 1.8s ease-in-out both' } : { opacity: 0 }}
      >
        <NeuralNoise color={AMBER} opacity={1} speed={0.0026} />
      </div>
      {firing && (
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 50% 55%, rgba(245,165,36,0.85) 0%, rgba(245,165,36,0.35) 40%, rgba(245,165,36,0) 75%)',
            animation: 'rm-flash-core 0.8s ease-out both',
          }}
        />
      )}
    </div>
  );
}
