import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from '@/store/ui-store';

describe('useUIStore', () => {
  beforeEach(() => {
    useUIStore.setState({ theme: 'dark', lang: 'en' });
  });

  it('defaults to dark + en', () => {
    expect(useUIStore.getState().theme).toBe('dark');
    expect(useUIStore.getState().lang).toBe('en');
  });

  it('toggleTheme flips light↔dark', () => {
    useUIStore.getState().toggleTheme();
    expect(useUIStore.getState().theme).toBe('light');
    useUIStore.getState().toggleTheme();
    expect(useUIStore.getState().theme).toBe('dark');
  });

  it('setLang updates language', () => {
    useUIStore.getState().setLang('pt');
    expect(useUIStore.getState().lang).toBe('pt');
  });

  it('setTheme sets the html data-theme attribute', () => {
    useUIStore.getState().setTheme('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
  });
});
