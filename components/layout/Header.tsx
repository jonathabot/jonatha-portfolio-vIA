'use client';

import { useTranslations } from 'next-intl';
import { useUIStore } from '@/store/ui-store';
import { useHasMounted } from '@/components/hooks/useHasMounted';
import { TextLink } from '@/components/ui/TextLink';
import type { Lang } from '@/store/ui-store';

export function Header() {
  const t = useTranslations('nav');
  const mounted = useHasMounted();
  const lang = useUIStore((s) => s.lang);
  const theme = useUIStore((s) => s.theme);
  const setLang = useUIStore((s) => s.setLang);
  const toggleTheme = useUIStore((s) => s.toggleTheme);

  const langClass = (active: boolean) =>
    active
      ? 'text-ink font-bold underline [text-underline-offset:3px] cursor-pointer'
      : 'text-idle cursor-pointer';

  const langButton = (value: Lang, label: string) => (
    <span
      role="button"
      tabIndex={0}
      onClick={() => setLang(value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setLang(value);
        }
      }}
      aria-pressed={lang === value}
      className={langClass(lang === value)}
    >
      {label}
    </span>
  );

  return (
    <div className="flex flex-wrap items-baseline justify-between gap-4 text-[14px]">
      <span className="font-bold">
        {lang === 'en' ? 'jonatha.mathews_' : 'jonatha.botelho_'}
      </span>
      <nav className="flex flex-1 flex-wrap items-baseline justify-end gap-x-[18px] gap-y-2 max-[640px]:justify-start">
        <TextLink href="#ferramentas">{t('tools')}</TextLink>
        <TextLink href="#experiencia">{t('exp')}</TextLink>
        <TextLink href="#formacao">{t('education')}</TextLink>
        <TextLink href="#cursos">{t('courses')}</TextLink>
        <TextLink href="#projetos">{t('projects')}</TextLink>
        <TextLink href="#contato">{t('contact')}</TextLink>
        <span className="text-dim">
          [ {langButton('pt', 'PT')} / {langButton('en', 'EN')} ]
        </span>
        <span
          role="button"
          tabIndex={0}
          onClick={toggleTheme}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggleTheme();
            }
          }}
          aria-label={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
          className="text-dim hover:text-ink cursor-pointer select-none"
        >
          [{mounted ? (theme === 'dark' ? '☀' : '☾') : '☾'}]
        </span>
      </nav>
    </div>
  );
}
