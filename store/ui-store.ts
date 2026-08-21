import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark';
export type Lang = 'pt' | 'en';

export function applyThemeAttr(theme: Theme): void {
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.theme = theme;
  }
}

type UIState = {
  theme: Theme;
  lang: Lang;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  setLang: (l: Lang) => void;
};

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      lang: 'en',
      setTheme: (t) => {
        applyThemeAttr(t);
        set({ theme: t });
      },
      toggleTheme: () =>
        get().setTheme(get().theme === 'dark' ? 'light' : 'dark'),
      setLang: (l) => set({ lang: l }),
    }),
    {
      name: 'jb-portfolio-ui',
      partialize: (s) => ({ theme: s.theme, lang: s.lang }),
      // Defer rehydration until after mount so server and first client render
      // agree (both use the defaults). The inline <head> script already applies
      // the persisted theme pre-paint, so there is no theme flash; language may
      // briefly show the default before rehydration, which is acceptable for a
      // client-only toggle with no locale routing.
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        if (state) applyThemeAttr(state.theme);
      },
    },
  ),
);
