'use client';

import { useTranslations } from 'next-intl';
import { SectionHeading } from '@/components/ui/SectionHeading';

type CourseItem = {
  title: string;
  issuer: string;
  year: string;
  details: string | null;
};

export function Courses() {
  const t = useTranslations();
  const items = t.raw('courses.items') as CourseItem[];

  return (
    <div id="cursos" className="border-faint border-b border-dashed py-10">
      <SectionHeading>04 — {t('section.courses')}</SectionHeading>
      <div className="flex flex-col gap-5">
        {items.map((course) => (
          <div
            key={`${course.title}-${course.year}`}
            className="border-hair grid grid-cols-[1fr_auto] gap-x-6 gap-y-1 border-b pb-5 last:border-0 last:pb-0 max-[520px]:grid-cols-1"
          >
            <div className="flex flex-col gap-1">
              <span className="text-ink text-[15px] font-bold">
                {course.title}
              </span>
              <span className="text-dim text-[14px]">{course.issuer}</span>
              {course.details && (
                <span className="text-faint text-[13px] leading-[1.6]">
                  {course.details}
                </span>
              )}
            </div>
            <span className="text-faint text-[13px] whitespace-nowrap">
              {course.year}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
