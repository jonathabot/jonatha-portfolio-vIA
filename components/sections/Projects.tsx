'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { TextLink } from '@/components/ui/TextLink';
import type { SiteContent } from '@/lib/cms/transform';

export function Projects({ projects }: { projects: SiteContent['projects'] }) {
  const t = useTranslations();
  const titles = t.raw('projects.titles') as string[];
  const dateLabels = t.raw('projects.dateLabels') as string[];
  const descs = t.raw('projects.descs') as string[];
  const stacks = t.raw('projects.stacks') as { k: string; v: string }[][];

  return (
    <div id="projetos" className="border-b border-dashed border-faint py-10">
      <SectionHeading>03 — {t('section.projects')}</SectionHeading>
      <div className="flex flex-col gap-11">
        {projects.map((p, i) => (
          <div
            key={i}
            className="grid grid-cols-[280px_1fr] items-start gap-7 max-[640px]:grid-cols-1"
          >
            <div className="h-[200px] w-[280px] border border-ink [filter:grayscale(1)] max-[640px]:w-full">
              {p.imageUrl ? (
                <Image
                  src={p.imageUrl}
                  alt={titles[i]}
                  width={280}
                  height={200}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-hair px-3 text-center text-[12px] text-dim">
                  {titles[i].split(' — ')[0]}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-baseline justify-between gap-4">
                <span className="text-[17px] font-bold underline [text-decoration-thickness:2px] [text-underline-offset:5px]">
                  {titles[i]}
                </span>
                <span className="text-[13px] text-faint">{dateLabels[i]}</span>
              </div>
              <span className="text-[15px] leading-[1.65] text-body">{descs[i]}</span>
              <div className="mt-1 flex flex-col gap-[5px] text-[13px] leading-[1.6] text-dim">
                {stacks[i].map((s, j) => (
                  <span key={j}>
                    <span className="font-bold text-ink">{s.k}:</span> {s.v}
                  </span>
                ))}
              </div>
              {p.repoUrl && (
                <TextLink
                  href={p.repoUrl}
                  target="_blank"
                  className="mt-1 text-[14px] font-bold"
                >
                  {t('projects.view')} →
                </TextLink>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
