import { useEffect, useState } from 'react';

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function useTypewriter(full: string, speed = 85): string {
  const [typed, setTyped] = useState(0);
  useEffect(() => {
    if (prefersReduced()) {
      // Sync to the user's reduced-motion preference: show the full name at once.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTyped(full.length);
      return;
    }
    const id = setInterval(() => {
      setTyped((n) => {
        if (n >= full.length) {
          clearInterval(id);
          return n;
        }
        return n + 1;
      });
    }, speed);
    return () => clearInterval(id);
  }, [full, speed]);
  return full.slice(0, typed);
}
