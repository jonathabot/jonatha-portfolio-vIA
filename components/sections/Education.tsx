'use client';

import { useTranslations } from 'next-intl';
import { SectionHeading } from '@/components/ui/SectionHeading';

export function Education({ show }: { show: boolean }) {
  const t = useTranslations();
  if (!show) return null;
  return (
    <div className="border-b border-dashed border-faint py-10">
      <SectionHeading>04 — {t('section.education')}</SectionHeading>
      <div className="flex flex-col gap-[14px] text-[15px]">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <span>
            <span className="font-bold">{t('education.degree')}</span> — {t('education.school')}
          </span>
          <span className="text-[13px] text-faint">{t('education.degreeYear')}</span>
        </div>
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <span>{t('education.langLine')}</span>
          <span className="text-[13px] text-faint">{t('education.langCert')}</span>
        </div>
      </div>
    </div>
  );
}
