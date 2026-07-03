'use client';

import { useTranslations } from 'next-intl';
import { SectionHeading } from '@/components/ui/SectionHeading';

export function Tools() {
  const t = useTranslations();
  const names = t.raw('tools.names') as string[];
  const items = t.raw('tools.items') as string[];
  return (
    <div id="ferramentas" className="border-b border-dashed border-faint py-10">
      <SectionHeading>01 — {t('section.tools')}</SectionHeading>
      <div className="flex flex-col gap-[14px] text-[15px]">
        {names.map((name, i) => (
          <div
            key={i}
            className="grid grid-cols-[190px_1fr] items-baseline gap-4 max-[520px]:grid-cols-1"
          >
            <span className="font-bold">→ {name}</span>
            <span className="leading-[1.6] text-body">{items[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
