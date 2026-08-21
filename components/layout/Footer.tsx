'use client';

import { useTranslations } from 'next-intl';
import { useUIStore } from '@/store/ui-store';

export function Footer() {
  const t = useTranslations();
  const lang = useUIStore((state) => state.lang);
  return (
    <div className="border-ink text-dim flex flex-wrap justify-between gap-4 border-t-[3px] border-double pt-5 pb-7 text-[12px]">
      <span>{t('meta.footer')}</span>
      <span>
        made by ♥ {lang === 'en' ? 'jonatha.mathews_' : 'jonatha.botelho_'}
      </span>
    </div>
  );
}
