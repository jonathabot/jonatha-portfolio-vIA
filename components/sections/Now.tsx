'use client';

import { useTranslations } from 'next-intl';
import { SectionHeading } from '@/components/ui/SectionHeading';

export function Now() {
  const t = useTranslations();
  const items = t.raw('now.items') as string[];
  return (
    <div id="agora" className="border-b border-dashed border-faint py-10">
      <SectionHeading
        right={<span className="text-[12px] text-faint">{t('meta.nowUpdated')}</span>}
      >
        00 — {t('section.now')}
      </SectionHeading>
      <div className="flex flex-col gap-[10px] text-[15px] leading-[1.65] text-body">
        {items.map((item, i) => (
          <div key={i} className="flex gap-3">
            <span className="font-bold text-ink">▸</span>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
