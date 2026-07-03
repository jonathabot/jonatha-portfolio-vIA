'use client';

import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations();
  return (
    <div className="flex flex-wrap justify-between gap-4 border-t-[3px] border-double border-ink pt-5 pb-7 text-[12px] text-dim">
      <span>{t('meta.footer')}</span>
      <span>made by ♥ jonatha.botelho_</span>
    </div>
  );
}
