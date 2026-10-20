'use client';

import { useEffect, useRef } from 'react';

/** Pauses SMIL (animateMotion) when the user prefers reduced motion. No re-renders. */
export function useReducedMotionSvg() {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => {
      const svg = ref.current;
      if (!svg) return;
      if (mq.matches) svg.pauseAnimations();
      else svg.unpauseAnimations();
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);
  return ref;
}
