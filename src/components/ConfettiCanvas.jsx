import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

const INTENSITY_MAP = {
  low: { particleCount: 40, spread: 55 },
  medium: { particleCount: 80, spread: 70 },
  high: { particleCount: 150, spread: 90 },
};

const COLORS = ['#C99E52', '#DDBEA9', '#A35D6A', '#58705C', '#FAF7F2', '#B45339'];

export default function ConfettiCanvas({ trigger, intensity = 'high' }) {
  const hasFired = useRef(false);

  useEffect(() => {
    if (!trigger || hasFired.current) return;
    hasFired.current = true;

    const cfg = INTENSITY_MAP[intensity] || INTENSITY_MAP.high;

    const fire = (angle, originX) =>
      confetti({
        particleCount: cfg.particleCount,
        spread: cfg.spread,
        angle,
        origin: { x: originX, y: 0.6 },
        colors: COLORS,
        gravity: 0.8,
        ticks: 300,
        scalar: 1.1,
      });

    // Staggered bursts: left → right → center
    fire(60, 0.15);
    setTimeout(() => fire(120, 0.85), 250);
    setTimeout(() => fire(90, 0.5), 500);

    // Reset so it can fire again if trigger toggles
    return () => {
      hasFired.current = false;
    };
  }, [trigger, intensity]);

  // Reset when trigger goes false so it can re-fire
  useEffect(() => {
    if (!trigger) {
      hasFired.current = false;
    }
  }, [trigger]);

  return null; // canvas-confetti creates its own canvas on document.body
}
