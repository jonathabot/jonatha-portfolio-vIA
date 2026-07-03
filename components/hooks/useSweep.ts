import { useCallback } from 'react';

const DELAYS = [400, 1000, 1600];
const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function useSweep() {
  return useCallback((el: HTMLElement | null, index: number) => {
    if (!el) return;
    if (prefersReduced()) {
      el.style.backgroundSize = '100% 100%';
      el.style.color = 'var(--bg)';
      return;
    }
    el.animate(
      [
        { backgroundSize: '0% 100%', color: 'var(--ink)', offset: 0 },
        { color: 'var(--ink)', offset: 0.45 },
        { color: 'var(--bg)', offset: 0.6 },
        { backgroundSize: '100% 100%', color: 'var(--bg)', offset: 1 },
      ],
      { duration: 600, delay: DELAYS[index] ?? 400, easing: 'ease-out', fill: 'forwards' },
    );
  }, []);
}
