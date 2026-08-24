'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Header, SketchNotes } from './PortfolioV2';
import { V2ActionLink } from './V2ActionLink';
import type { SiteContent } from '@/lib/cms/transform';

export function ProjectDetail({
  site,
  index,
}: {
  site: SiteContent;
  index: number;
}) {
  const t = useTranslations();
  const titles = t.raw('projects.titles') as string[];
  const descriptions = t.raw('projects.descs') as string[];
  const dates = t.raw('projects.dateLabels') as string[];
  const stacks = t.raw('projects.stacks') as { k: string; v: string }[][];
  const project = site.projects[index] ?? { imageUrl: null, repoUrl: null };
  const title = titles[index] ?? 'Enterprise web & data solutions';
  const description =
    descriptions[index] ??
    'Public-safe overview of confidential corporate work across web applications, cloud services, integrations and analytics.';
  const date = dates[index] ?? '2024 — PRESENT';
  const stack = stacks[index] ?? [
    { k: 'Scope', v: 'React · Next.js · Google Cloud · Data integrations' },
  ];

  return (
    <main className="min-h-screen lg:pb-16">
      <Header links={site.hero.links} active="projetos" />
      <section className="px-5 pt-10 md:px-8 md:pt-14 lg:hidden">
        <div className="border-ink flex min-h-[196px] flex-col justify-center gap-2 border-b-2 md:min-h-[210px]">
          <Link href="/projects" className="text-[9px] font-bold underline">
            ← [05] PROJECTS / MODULE 0{index + 1}
          </Link>
          <h1 className="font-display m-0 max-w-[620px] text-[43px] leading-[.9] uppercase md:text-[50px]">
            {title}
          </h1>
          <p className="m-0 text-[8px] tracking-[.08em] md:text-[9px]">
            GAMIFIED TECHNOLOGY EDUCATION // WEB APPLICATION
          </p>
        </div>

        <div className="border-ink bg-panel relative mt-6 h-[230px] overflow-hidden border-2 md:h-[300px]">
          <div className="bg-ink text-paper flex h-8 items-center justify-between px-3 text-[8px] font-bold md:h-9 md:px-4 md:text-[9px]">
            <span>PROJECT MEDIA 0{index + 1} / CMS ASSET</span>
            <span className="text-yellow">16:9</span>
          </div>
          {project.imageUrl ? (
            <Image src={project.imageUrl} alt={`Preview of ${title}`} fill className="object-cover pt-8 md:pt-9" />
          ) : (
            <div className="absolute inset-x-0 top-8 bottom-[34px] grid place-items-center bg-[linear-gradient(135deg,transparent_49.5%,var(--ink)_50%,transparent_50.5%)] md:top-9 md:bottom-[38px]">
              <span className="text-faint text-[10px] font-bold">[ PROJECT SCREENSHOT / CMS IMAGE ]</span>
            </div>
          )}
          <div className="border-ink absolute inset-x-0 bottom-0 flex h-[34px] items-center justify-between border-t px-3 text-[8px] md:h-[38px] md:px-4">
            <b>FIG.02 — PRODUCT INTERFACE</b><span className="text-faint">DYNAMIC MEDIA</span>
          </div>
        </div>

        <div className="grid gap-6 py-6 md:grid-cols-[1fr_250px] md:min-h-[500px]">
          <div className="border-ink flex flex-col gap-3 border-b-2 pb-6 md:border-b-0 md:pb-0">
            <span className="text-faint text-[9px] font-bold">01 / OVERVIEW</span>
            <p className="font-body m-0 text-[12px] leading-[1.45]">{description}</p>
            <span className="text-faint mt-2 text-[9px] font-bold">02 / CHALLENGE</span>
            <p className="font-body m-0 text-[12px] leading-[1.45]">Create an engaging learning experience that keeps educational progress clear while supporting competitive mechanics and immediate feedback.</p>
            <span className="text-faint mt-2 text-[9px] font-bold">03 / SOLUTION &amp; OUTCOMES</span>
            <p className="font-body m-0 text-[11px] leading-[1.45]">→ Structured lesson and quiz flows with reusable React components.</p>
            <p className="font-body m-0 text-[11px] leading-[1.45]">→ Scoring and leaderboard feedback designed for continuous engagement.</p>
            <p className="font-body m-0 text-[11px] leading-[1.45]">→ Responsive interface prepared for desktop, tablet and mobile learners.</p>
          </div>
          <aside className="v2-shadow border-ink bg-panel flex min-h-[360px] flex-col border-2 p-[18px]">
            <span className="text-2xl">⌘◇</span>
            {[
              ['STATUS', 'PUBLIC PROJECT'],
              ['ROLE', 'FRONT-END DEVELOPMENT'],
              ['TYPE', 'EDUCATION PLATFORM'],
              ['STACK', 'REACT · TYPESCRIPT · API'],
              ['DELIVERY', 'RESPONSIVE WEB APP'],
            ].map(([label, value]) => (
              <div key={label} className="border-ink/25 flex min-h-[58px] flex-col justify-center gap-1 border-b md:min-h-[74px]">
                <span className="text-faint text-[7px] tracking-widest">{label}</span>
                <b className="font-display text-[12px]">{value}</b>
              </div>
            ))}
          </aside>
        </div>
      </section>
      <section className="mx-auto hidden max-w-[1280px] px-5 py-10 md:px-12 md:py-14 lg:block">
        <Link href="/projects" className="text-[10px] font-bold underline">
          ← [05] PROJECTS / MODULE 0{index + 1}
        </Link>
        <h1 className="font-display mt-5 mb-7 w-full text-[clamp(40px,4vw,56px)] leading-[.92]">
          {title}
        </h1>
        <p className="text-faint border-ink mt-0 border-b-2 pb-6 text-[10px] tracking-[.15em]">
          {`${date} // SELECTED CASE STUDY`}
        </p>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            <p className="text-faint text-[9px]">01 / OVERVIEW</p>
            <p className="font-body max-w-4xl text-base leading-8">
              {description}
            </p>
            <p className="text-faint mt-10 text-[9px]">02 / PROJECT IMAGE</p>
            <div className="v2-shadow border-ink bg-panel relative mt-3 aspect-[16/8] overflow-hidden border-2">
              {project.imageUrl ? (
                <Image
                  src={project.imageUrl}
                  alt={`Preview of ${title}`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 grid place-items-center bg-[linear-gradient(135deg,transparent_49.5%,var(--ink)_50%,transparent_50.5%)]">
                  <span className="bg-panel border-ink border-2 px-6 py-3 text-[10px] font-bold">
                    PROJECT MEDIA / CMS
                  </span>
                </div>
              )}
            </div>
          </div>
          <aside className="v2-shadow border-ink bg-panel border-2 p-6">
            <span className="text-3xl">◇ 0{index + 1}</span>
            <h2 className="font-display text-2xl">PROJECT SPECIFICATION</h2>
            {stack.map((item) => (
              <div key={item.k} className="border-ink/25 border-t py-4">
                <span className="text-faint text-[8px]">
                  {item.k.toUpperCase()}
                </span>
                <p className="font-display m-0 mt-1 text-lg">{item.v}</p>
              </div>
            ))}
            {project.repoUrl && (
              <V2ActionLink href={project.repoUrl} external className="mt-4">
                OPEN REPOSITORY ↗
              </V2ActionLink>
            )}
          </aside>
        </div>
      </section>
      <SketchNotes />
      <footer className="border-ink bg-paper mt-10 lg:hidden">
        <nav className="border-ink flex h-12 items-center justify-between border-y-2 px-5 text-[8px] font-bold md:h-[54px] md:px-8 md:text-[10px]">
          <Link href="/projects">← PROJECTS</Link>
          <span className="text-faint">[ 05 / 06 ]</span>
          <Link href="/contact">CONTACT →</Link>
        </nav>
        <div className="border-ink flex h-9 items-center justify-between border-b px-5 text-[8px] md:h-10 md:px-8">
          <span>J.BOTELHO © 2026</span>
          <span className="text-faint hidden md:inline">PORTFOLIO SYSTEM // V2</span>
          <span className="text-[#357a38]">● AVAILABLE</span>
        </div>
      </footer>
    </main>
  );
}
