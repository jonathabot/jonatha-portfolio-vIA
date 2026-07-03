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
      theme: 'light',
      lang: 'pt',
      setTheme: (t) => {
        applyThemeAttr(t);
        set({ theme: t });
      },
      toggleTheme: () => get().setTheme(get().theme === 'dark' ? 'light' : 'dark'),
      setLang: (l) => set({ lang: l }),
    }),
    {
      name: 'jb-portfolio-ui',
      partialize: (s) => ({ theme: s.theme, lang: s.lang }),
      onRehydrateStorage: () => (state) => {
        if (state) applyThemeAttr(state.theme);
      },
    },
  ),
);
