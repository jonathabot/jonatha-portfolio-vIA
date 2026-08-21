'use client';

import { useTranslations } from 'next-intl';
import { useUIStore } from '@/store/ui-store';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Chip } from '@/components/ui/Chip';
import { calcDuration } from '@/lib/duration';
import { formatMonthYear } from '@/lib/month';
import type { SiteContent } from '@/lib/cms/transform';

export function Experience({
  experience,
}: {
  experience: SiteContent['experience'];
}) {
  const t = useTranslations();
  const lang = useUIStore((s) => s.lang);
  const roles = t.raw('experience.roles') as string[];
  const bullets = t.raw('experience.bullets') as {
    head: string;
    text: string;
  }[][];
  const present = lang === 'pt' ? 'presente' : 'present';

  return (
    <div id="experiencia" className="border-faint border-b border-dashed py-10">
      <SectionHeading>02 — {t('section.exp')}</SectionHeading>
      <div className="flex flex-col gap-10">
        {experience.map((job, i) => {
          const start = formatMonthYear(job.start, lang);
          const end = job.end ? formatMonthYear(job.end, lang) : present;
          const dur = calcDuration(job.start, job.end, lang);
          return (
            <div key={i} className="grid grid-cols-[14px_minmax(0,1fr)] gap-5">
              <div className="flex flex-col items-center gap-[6px] pt-[6px]">
                <span className="bg-ink h-[9px] w-[9px] flex-none" />
                <span className="bg-hair w-px flex-1" />
              </div>
              <div className="flex flex-col gap-[10px]">
                <div className="flex flex-wrap items-baseline justify-between gap-4">
                  <span className="text-[17px] font-bold underline [text-decoration-thickness:2px] [text-underline-offset:5px]">
                    {roles[i]} | {job.company}
                  </span>
                  <span className="text-faint text-[13px] whitespace-nowrap">
                    {start} — {end} · {dur}
                  </span>
                </div>
                <div className="text-body flex flex-col gap-2 text-[15px] leading-[1.65]">
                  {bullets[i].map((b, j) => (
                    <div key={j} className="flex gap-3">
                      <span className="text-faint">·</span>
                      <span>
                        <span className="text-ink font-bold">{b.head}</span>{' '}
                        {b.text}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-1 flex flex-wrap gap-2">
                  {job.techs.map((tech) => (
                    <Chip key={tech} variant="faint">
                      {tech}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
