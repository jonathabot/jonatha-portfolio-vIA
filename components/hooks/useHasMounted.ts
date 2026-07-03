import { useEffect, useState } from 'react';

export function useHasMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  // One-shot mount flag: runs once, cannot cascade.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);
  return mounted;
}
