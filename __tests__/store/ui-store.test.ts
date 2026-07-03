import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from '@/store/ui-store';

describe('useUIStore', () => {
  beforeEach(() => {
    useUIStore.setState({ theme: 'light', lang: 'pt' });
  });

  it('defaults to light + pt', () => {
    expect(useUIStore.getState().theme).toBe('light');
    expect(useUIStore.getState().lang).toBe('pt');
  });

  it('toggleTheme flips light↔dark', () => {
    useUIStore.getState().toggleTheme();
    expect(useUIStore.getState().theme).toBe('dark');
    useUIStore.getState().toggleTheme();
    expect(useUIStore.getState().theme).toBe('light');
  });

  it('setLang updates language', () => {
    useUIStore.getState().setLang('en');
    expect(useUIStore.getState().lang).toBe('en');
  });

  it('setTheme sets the html data-theme attribute', () => {
    useUIStore.getState().setTheme('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
  });
});
