'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useUIStore } from '@/store/ui-store';
import { Contact } from '@/components/v2/Contact';
import type { SiteContent } from '@/lib/cms/transform';
import type { Messages } from '@/lib/cms/transform';

const MotionLink = motion.create(Link);
const hoverButton = {
  backgroundColor: 'var(--ink)',
  color: 'var(--paper)',
  y: -2,
};
const buttonTransition = { duration: 0.18, ease: 'easeOut' as const };

const Character = dynamic(
  () =>
    import('@/components/three/JonathaCharacter3D').then(
      (m) => m.JonathaCharacter3D,
    ),
  { ssr: false },
);

const nav = [
  'overview',
  'experiencia',
  'stack',
  'academics',
  'projetos',
  'contato',
] as const;

export type PortfolioScreen = (typeof nav)[number];

const routes: Record<PortfolioScreen, string> = {
  overview: '/',
  experiencia: '/experience',
  stack: '/tech-stack',
  academics: '/academics',
  projetos: '/projects',
  contato: '/contact',
};

const accents = ['var(--yellow)', 'var(--pink)', 'var(--blue)', 'var(--green)'];
const projectIcons = [
  '/images/v2/programatical-learning.svg',
  '/images/v2/ai-assisted-network.svg',
  '/images/v2/headless-portfolio.svg',
  '/images/v2/enterprise-data-solutions.svg',
];

export function PaintSplashes() {
  return (
    <div aria-hidden className="relative h-52 w-36">
      <i className="paint-splash absolute top-0 left-5 h-[63px] w-[90px] -rotate-[20deg] bg-[#e03030]/85" />
      <i className="paint-splash absolute top-[60px] left-[55px] h-[53px] w-[75px] rotate-[15deg] bg-[#f2d45c]/85" />
      <i className="paint-splash absolute top-[130px] left-[10px] h-14 w-20 -rotate-[10deg] bg-[#4080c0]/85" />
      <i className="paint-splash absolute top-10 left-20 h-[21px] w-[30px] rotate-[30deg] bg-[#e03030]/85" />
      <i className="paint-splash absolute top-[150px] left-[100px] h-[18px] w-[25px] -rotate-[5deg] bg-[#f2d45c]/85" />
      <i className="paint-splash absolute top-[190px] left-[70px] h-[25px] w-[35px] rotate-[20deg] bg-[#4080c0]/85" />
    </div>
  );
}

function Crown({ className = '' }: { className?: string }) {
  return (
    <Image
      src="/images/crown-name.png"
      alt=""
      width={72}
      height={52}
      className={className}
    />
  );
}

function CrownDoodle({ className = '' }: { className?: string }) {
  return (
    <Image
      src="/images/v2/basquiat-crown.png"
      alt=""
      width={626}
      height={518}
      className={className}
    />
  );
}

function ArrowLeft({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      width="80"
      height="40"
      viewBox="0 0 80 40"
      fill="none"
      aria-hidden
    >
      <path
        d="M70 20 C50 20 30 12 10 20"
        stroke="#1a1a1a"
        strokeOpacity=".55"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M14 14 L8 20 L14 26"
        stroke="#1a1a1a"
        strokeOpacity=".55"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowRight({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      width="80"
      height="40"
      viewBox="0 0 80 40"
      fill="none"
      aria-hidden
    >
      <path
        d="M10 20 C30 20 50 12 70 20"
        stroke="#1a1a1a"
        strokeOpacity=".55"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M66 14 L72 20 L66 26"
        stroke="#1a1a1a"
        strokeOpacity=".55"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Header({
  links,
  active,
}: {
  links: SiteContent['hero']['links'];
  active?: PortfolioScreen;
}) {
  const lang = useUIStore((s) => s.lang);
  const setLang = useUIStore((s) => s.setLang);
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const t = useTranslations();
  const v2 = t.raw('v2') as Messages['v2'];
  const labels = Object.fromEntries(
    v2.navigation.items.map((item) => [item.id, item.label]),
  ) as Record<PortfolioScreen, string>;
  const githubLabel = links.github
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '');
  const linkedInLabel = links.linkedin
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '');

  return (
    <header className="border-ink lg:bg-bg sticky top-0 z-50 lg:border-b-2">
      <div className="relative mx-auto hidden h-[130px] max-w-[1920px] lg:block">
        <div className="absolute top-[18px] left-7 flex gap-4">
          <MotionLink
            className="border-ink border-2 px-3 py-2 text-[11px] font-bold"
            href="/"
            whileHover={hoverButton}
            transition={buttonTransition}
          >
            ◎ [{v2.identity.website}] ☠
          </MotionLink>
          <MotionLink
            className="border-ink border-2 px-3 py-2 text-[11px] font-bold"
            href={links.github}
            whileHover={hoverButton}
            transition={buttonTransition}
          >
            ● [{githubLabel}] ✋
          </MotionLink>
        </div>
        <MotionLink
          className="border-ink absolute top-[66px] left-7 border-2 px-4 py-2 text-[11px] font-bold"
          href={links.linkedin}
          whileHover={hoverButton}
          transition={buttonTransition}
        >
          in [{linkedInLabel}]
        </MotionLink>
        <div className="absolute top-1 bottom-3 left-1/2 flex -translate-x-1/2 flex-col items-center justify-between">
          <Link
            href="/"
            aria-label={v2.accessibility.home}
            className="cursor-pointer"
          >
            <Crown className="h-10 w-11 shrink-0 object-contain" />
          </Link>
          <div className="font-display text-5xl leading-none whitespace-nowrap">
            {v2.identity.name}
          </div>
          <div className="text-dim text-[11px] whitespace-nowrap">
            <b className="text-red mr-4">{v2.identity.coderLabel}</b>
            {` ${v2.identity.roleLine}`}
          </div>
        </div>
        <div className="absolute top-6 right-28 text-right text-[10px] leading-6">
          <b className="text-[12px]">{v2.identity.origin}</b>
          <br />
          {v2.identity.languages}
        </div>
        <div className="border-ink absolute top-[78px] right-28 flex border text-[9px] font-bold">
          <button
            className={`cursor-pointer px-5 py-2 ${lang === 'pt' ? 'bg-ink text-bg' : ''}`}
            onClick={() => setLang('pt')}
          >
            {v2.global.languagePt}
          </button>
          <button
            className={`cursor-pointer px-5 py-2 ${lang === 'en' ? 'bg-ink text-yellow' : ''}`}
            onClick={() => setLang('en')}
          >
            {v2.global.languageEn}
          </button>
        </div>
        <span className="text-dim absolute right-3 bottom-1 text-[8px] underline underline-offset-2">
          {v2.global.version}
        </span>
      </div>
      <div className="h-0 lg:hidden">
        <button
          aria-label={v2.navigation.menuLabel}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="border-ink bg-bg fixed top-4 right-5 z-[51] h-10 w-12 cursor-pointer border-2 text-2xl"
        >
          {open ? '×' : '☰'}
          <i className="bg-yellow absolute top-0 right-0 h-2.5 w-3" />
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 bg-[#1a1a1a]/45 lg:hidden"
            onClick={() => setOpen(false)}
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <motion.nav
              className="border-ink bg-paper mt-[68px] mr-5 ml-auto flex h-auto max-h-[calc(100%_-_84px)] w-[calc(100%_-_40px)] max-w-[460px] flex-col overflow-y-auto border-2 shadow-[7px_7px_0_var(--ink)] md:w-[46vw]"
              onClick={(event) => event.stopPropagation()}
              initial={reduceMotion ? false : { x: 36, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={reduceMotion ? undefined : { x: 24, opacity: 0 }}
              transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="border-ink flex h-12 shrink-0 items-center justify-between border-b-2 px-3">
                <span className="text-faint text-[8px] tracking-[.16em]">
                  {v2.navigation.heading}
                </span>
                <button
                  type="button"
                  aria-label={v2.navigation.closeLabel}
                  onClick={() => setOpen(false)}
                  className="bg-ink text-paper h-8 w-8 cursor-pointer text-lg"
                >
                  ×
                </button>
              </div>
              <div className="shrink-0">
                {nav.map((id, i) => (
                  <Link
                    key={id}
                    href={routes[id]}
                    onClick={() => setOpen(false)}
                    className={`border-ink/30 flex h-[54px] items-center border-b px-3 text-left font-bold ${active === id ? 'bg-ink text-yellow' : ''}`}
                  >
                    <span className="w-9 shrink-0 text-[8px]">[0{i + 1}]</span>
                    <b
                      className={`font-display text-lg ${active === id ? 'text-paper' : ''}`}
                    >
                      {labels[id]}
                    </b>
                    <span
                      className={`ml-3 box-border text-left font-['JetBrains_Mono',system-ui,sans-serif] text-[13px] leading-normal font-normal whitespace-nowrap ${active === id ? 'text-yellow' : 'text-[#1A1A1A]'}`}
                    >
                      ↗
                    </span>
                  </Link>
                ))}
              </div>
              <div className="border-ink border-t-2 p-3">
                <div className="flex items-center justify-between">
                  <div className="border-ink flex border text-[8px] font-bold">
                    <button
                      onClick={() => setLang('pt')}
                      className={`cursor-pointer px-4 py-2 ${lang === 'pt' ? 'bg-ink text-paper' : ''}`}
                    >
                      {v2.global.languagePt}
                    </button>
                    <button
                      onClick={() => setLang('en')}
                      className={`cursor-pointer px-4 py-2 ${lang === 'en' ? 'bg-ink text-yellow' : ''}`}
                    >
                      {v2.global.languageEn}
                    </button>
                  </div>
                  <span className="text-[8px]">[ ☀ / ☽ ]</span>
                </div>
              </div>
              <div className="border-ink min-h-[112px] space-y-1 border-t-2 px-3 pt-4 pb-8 text-[8px]">
                <p className="m-0">● {githubLabel}</p>
                <p className="m-0">in {linkedInLabel}</p>
                <p className="m-0 pt-1 text-[#357a38]">
                  {v2.global.availableForWork}
                </p>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function SectionTitle({
  index,
  title,
  subtitle,
}: {
  index: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="border-ink border-b-[3px] pb-5">
      <p className="text-faint m-0 text-[10px]">[{index}] —————————————</p>
      <h2 className="font-display my-2 max-w-[300px] text-[clamp(42px,4vw,48px)] leading-none tracking-[.02em] md:max-w-none">
        {title}
      </h2>
      <p className="text-faint m-0 text-[10px] tracking-[.12em]">{subtitle}</p>
    </div>
  );
}

function Portrait() {
  const t = useTranslations();
  const v2 = t.raw('v2') as Messages['v2'];
  return (
    <div className="border-ink bg-paper relative mx-auto h-[330px] w-[260px] border-[2.5px] shadow-[8px_8px_0_var(--ink)] md:h-[350px] md:w-[294px] lg:h-[374px] lg:w-[280px]">
      <CrownDoodle className="pointer-events-none absolute -top-[52px] left-1/2 z-10 h-[74px] w-[100px] -translate-x-1/2 object-contain" />
      <div className="h-[300px] overflow-hidden md:h-[320px] lg:h-[344px]">
        <Character />
      </div>
      <div className="bg-ink text-yellow absolute inset-x-0 bottom-0 flex h-[30px] items-center justify-center text-[9px] font-bold tracking-[.14em]">
        {v2.overview.figureCaption}
      </div>
    </div>
  );
}

function PortraitStation() {
  const reducedMotion = useReducedMotion();
  const t = useTranslations();
  const v2 = t.raw('v2') as Messages['v2'];

  return (
    <div className="flex flex-col items-center">
      <Link
        href="/character"
        aria-label={v2.accessibility.characterStudy}
        className="block cursor-pointer"
      >
        <Portrait />
      </Link>
      <MotionLink
        href="/contact"
        className="v2-shadow border-ink text-paper font-display mt-9 hidden border-2 bg-[#2a1c12] px-10 py-4 text-xl tracking-wide xl:block"
        initial="rest"
        animate="rest"
        whileHover={reducedMotion ? undefined : 'hover'}
      >
        <motion.span
          className="inline-block"
          variants={{
            rest: { x: 0, rotate: 0 },
            hover: {
              x: [0, -1.5, 1.5, -1, 1, 0],
              rotate: [0, -0.35, 0.35, -0.2, 0.2, 0],
              transition: {
                duration: 0.34,
                ease: 'easeInOut',
                repeat: Infinity,
              },
            },
          }}
        >
          {v2.overview.initializeContact}
        </motion.span>
      </MotionLink>
      <span className="text-faint mt-4 hidden text-[8px] tracking-[.18em] xl:block">
        {v2.global.availableForWork}
      </span>
    </div>
  );
}

function ResponsiveStack() {
  const t = useTranslations();
  const v2 = t.raw('v2') as Messages['v2'];
  return (
    <div className="border-ink flex w-full flex-col border-y-2 py-5 md:h-full md:border-t-0 md:py-0 xl:hidden">
      <h2 className="font-display mb-4 text-[28px] leading-none md:mb-0 md:flex md:min-h-[58px] md:items-center">
        {v2.overview.selectedStack}
      </h2>
      {v2.overview.responsiveStack.map(({ label, value }) => (
        <div
          key={label}
          className="border-ink/25 flex min-h-11 items-center border-b text-[8px] last:border-0 md:min-h-0 md:flex-1"
        >
          <b className="w-24 shrink-0">{label} /</b>
          <span>{value}</span>
        </div>
      ))}
    </div>
  );
}

function ResponsiveWorks({
  titles,
  descriptions,
}: {
  titles: string[];
  descriptions: string[];
}) {
  const t = useTranslations();
  const v2 = t.raw('v2') as Messages['v2'];
  return (
    <section className="border-ink mt-6 border-t-2 py-6 xl:hidden">
      <h2 className="font-display mb-4 text-[28px] leading-[.9] md:text-[30px]">
        {v2.overview.worksTitle}
      </h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {titles.slice(0, 4).map((title, index) => (
          <ProjectCard
            key={title}
            title={title}
            desc={descriptions[index]}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}

function ProjectCard({
  title,
  desc,
  index,
}: {
  title: string;
  desc: string;
  index: number;
}) {
  const t = useTranslations();
  const v2 = t.raw('v2') as Messages['v2'];
  return (
    <article className="border-ink bg-panel relative flex min-h-0 min-w-0 flex-col overflow-hidden border-r-2 border-b-2 p-3 md:p-4">
      <i
        className="border-ink absolute top-0 right-0 h-7 w-7 border-b-2 border-l-2"
        style={{ background: accents[index % 4] }}
      />
      <Image
        src={projectIcons[index % projectIcons.length]}
        alt=""
        width={80}
        height={40}
        className="h-8 w-14 object-contain object-left md:h-10 md:w-20"
      />
      <div className="flex min-h-0 flex-1 flex-col justify-between py-2 md:py-4">
        <span className="text-faint text-[7px] tracking-[.16em] md:text-[9px]">
          {v2.overview.moduleLabel} 0{index + 1}
        </span>
        <h3 className="font-display my-2 text-sm leading-tight md:text-xl">
          {title.toUpperCase()}
        </h3>
        <p className="font-body text-body line-clamp-2 max-h-10 overflow-hidden text-[9px] leading-relaxed md:max-h-[5.75rem] md:text-[12px]">
          {desc}
        </p>
      </div>
      <div className="flex h-9 shrink-0 items-end justify-end md:h-12">
        <MotionLink
          href={`/projects/${index + 1}`}
          className="border-ink bg-paper border px-2 py-1 text-[7px] font-bold md:px-5 md:py-2 md:text-[9px]"
          whileHover={hoverButton}
          transition={buttonTransition}
        >
          {v2.overview.seeProject}
        </MotionLink>
      </div>
    </article>
  );
}

export function SketchNotes() {
  const t = useTranslations();
  const v2 = t.raw('v2') as Messages['v2'];
  return (
    <p
      aria-hidden
      data-testid="overview-sketch-notes"
      className="text-faint pointer-events-none absolute bottom-10 left-7 hidden w-40 -rotate-3 text-[13px] leading-[2] whitespace-pre xl:block"
    >
      {v2.overview.annotations}
    </p>
  );
}

function SkillCard({
  name,
  items,
  index,
}: {
  name: string;
  items: string;
  index: number;
}) {
  const reducedMotion = useReducedMotion();
  const t = useTranslations();
  const v2 = t.raw('v2') as Messages['v2'];
  const skills = items.split(' · ').slice(0, index === 0 ? 8 : 6);
  return (
    <article className="v2-shadow border-ink bg-panel h-[212px] border-2">
      <h3
        className="font-display border-ink m-0 flex h-11 items-center justify-between border-b-2 px-5 text-lg"
        style={{ background: accents[index] }}
      >
        {name}
        <small className="font-mono text-[8px] font-normal">
          {skills.length} {v2.sections.stack.toolsLabel}
        </small>
      </h3>
      <div
        className={`grid h-[164px] grid-cols-2 gap-x-8 px-5 py-5 ${
          skills.length <= 4 ? 'content-start gap-y-5' : 'content-between'
        }`}
      >
        {skills.map((skill, skillIndex) => (
          <div key={skill}>
            <div className="flex justify-between text-[9px]">
              <span>[{skill}]</span>
              <span className="text-faint">
                {95 - ((skillIndex * 7 + index * 3) % 22)}%
              </span>
            </div>
            <div className="border-ink mt-1 h-2 border">
              <motion.i
                className="block h-full"
                initial={reducedMotion ? false : { width: 0 }}
                animate={{
                  width: `${82 - ((skillIndex * 5 + index * 4) % 20)}%`,
                }}
                transition={{
                  duration: 0.65,
                  delay: reducedMotion ? 0 : index * 0.08 + skillIndex * 0.06,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{
                  background: accents[index],
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

export function PortfolioV2({
  site,
  screen = 'overview',
}: {
  site: SiteContent;
  screen?: PortfolioScreen;
}) {
  const reducedMotion = useReducedMotion();
  const t = useTranslations();
  const v2 = t.raw('v2') as Messages['v2'];
  const navLabels = Object.fromEntries(
    v2.navigation.items.map((item) => [item.id, item.label]),
  ) as Record<PortfolioScreen, string>;
  const roles = t.raw('experience.roles') as string[];
  const periodLabels = t.raw('experience.periodLabels') as string[];
  const employmentTypes = t.raw('experience.employmentTypes') as string[];
  const experienceLocations = t.raw('experience.locations') as string[];
  const experienceContexts = t.raw('experience.contexts') as string[];
  const bullets = t.raw('experience.bullets') as {
    head: string;
    text: string;
  }[][];
  const tools = t.raw('tools.names') as string[];
  const toolItems = t.raw('tools.items') as string[];
  const projectTitles = t.raw('projects.titles') as string[];
  const projectDescriptions = t.raw('projects.descs') as string[];
  const courses = t.raw('courses.items') as {
    title: string;
    issuer: string;
    year: string;
    details: string | null;
  }[];
  const screenIndex = nav.findIndex((id) => id === screen);
  const previous = nav[(screenIndex - 1 + nav.length) % nav.length];
  const next = nav[(screenIndex + 1) % nav.length];

  useEffect(() => {
    // Route changes must always behave like a new fixed screen. Browsers may
    // otherwise restore the previous route's scroll offset.
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [screen]);

  return (
    <main className="min-h-dvh pb-[84px] md:pb-[94px] lg:pb-[54px] xl:h-dvh xl:overflow-hidden">
      <Header links={site.hero.links} active={screen} />
      <motion.div
        key={screen}
        initial={
          reducedMotion || screen === 'overview' ? false : { opacity: 0, y: 22 }
        }
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      >
        {screen === 'overview' && (
          <section
            id="overview"
            className="v2-screen v2-overview-screen border-ink relative grid border-b-2 xl:grid-cols-[minmax(0,1fr)_480px]"
          >
            <SketchNotes />
            <div className="relative z-10 px-5 py-0 md:px-8 xl:flex xl:items-center xl:justify-center xl:gap-14 xl:px-5 xl:py-0">
              <div className="border-ink relative mb-8 flex min-h-[220px] flex-col justify-evenly border-b-2 py-4 md:h-[168px] md:min-h-0 md:py-3 xl:hidden">
                <div className="flex items-center gap-3">
                  <Link
                    href="/"
                    aria-label={v2.accessibility.home}
                    className="h-10 w-10 shrink-0"
                  >
                    <Crown className="h-10 w-10 object-contain" />
                  </Link>
                  <p className="text-faint text-[10px]">
                    {v2.overview.eyebrow}
                  </p>
                </div>
                <h1 className="font-display my-2 text-[clamp(52px,10vw,82px)] leading-[.86]">
                  {v2.identity.name}
                </h1>
                <p className="text-[10px] leading-6">
                  <b className="text-red">{v2.identity.coderLabel}</b>
                  {`  ${v2.identity.roleLine}`}
                </p>
              </div>
              <div className="border-ink mb-8 flex h-12 items-center justify-between border-y text-[8px] md:hidden">
                <span>
                  ● {site.hero.links.github.replace(/^https?:\/\//, '')}
                </span>
                <span>
                  in {site.hero.links.linkedin.replace(/^https?:\/\//, '')}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center gap-8 md:flex-row md:items-stretch xl:contents">
                <div className="hidden flex-col text-[12px] leading-7 xl:flex">
                  <b>{v2.overview.frontEndTitle}</b>
                  <hr className="border-ink" />
                  {v2.overview.frontEndItems.map((item) => (
                    <span key={item}>[{item}]</span>
                  ))}
                  <ArrowRight className="mt-5 translate-x-10 self-end" />
                </div>
                <PortraitStation />
                <div className="hidden w-full md:block md:min-w-0 md:flex-1 xl:hidden">
                  <ResponsiveStack />
                </div>
                <div className="hidden text-[12px] leading-7 xl:block">
                  <div className="flex flex-col">
                    <b>{v2.overview.cloudTitle}</b>
                    <hr className="border-ink my-0 w-full" />
                    {v2.overview.cloudItems.map((item) => (
                      <span key={item}>[{item}]</span>
                    ))}
                    <ArrowLeft className="mt-2 hidden -translate-x-10 self-start lg:block" />
                  </div>
                  <div className="mt-3 flex flex-col">
                    <b>{v2.overview.dataTitle}</b>
                    <hr className="border-ink my-0 w-full" />
                    {v2.overview.dataItems.map((item) => (
                      <span key={item}>[{item}]</span>
                    ))}
                    <ArrowLeft className="mt-2 hidden -translate-x-10 self-start lg:block" />
                  </div>
                </div>
              </div>
              <div className="mt-6 md:hidden">
                <ResponsiveStack />
              </div>
              <ResponsiveWorks
                titles={projectTitles}
                descriptions={projectDescriptions}
              />
              <div className="border-ink flex flex-col gap-3 border-t-2 py-6 xl:hidden">
                <span className="text-faint text-[8px] tracking-[.14em]">
                  {v2.overview.availableProjects}
                </span>
                <Link
                  href="/contact"
                  className="bg-ink text-paper flex h-12 items-center justify-between px-4 font-bold"
                >
                  {v2.overview.initializeContact} <span>↗</span>
                </Link>
              </div>
            </div>
            <aside className="border-ink bg-panel hidden min-h-0 overflow-hidden border-l-2 xl:flex xl:flex-col">
              <h2 className="font-display bg-ink text-paper shrink-0 py-5 text-center text-lg tracking-wide">
                {v2.overview.worksTitle}
              </h2>
              <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)_minmax(0,1fr)] sm:grid-cols-2 md:grid-cols-2 [&>article]:h-full [&>article]:min-h-0">
                {projectTitles.slice(0, 4).map((p, i) => (
                  <ProjectCard
                    key={p}
                    title={p}
                    desc={projectDescriptions[i]}
                    index={i}
                  />
                ))}
              </div>
            </aside>
          </section>
        )}
        {screen === 'experiencia' && (
          <section
            id="experiencia"
            className="v2-screen mx-auto max-w-[1200px] px-5 py-10 lg:px-0"
          >
            <SectionTitle
              index={v2.sections.experience.index}
              title={v2.sections.experience.title}
              subtitle={v2.sections.experience.subtitle}
            />
            <div>
              {site.experience.map((job, i) => (
                <article
                  key={job.company}
                  className="border-ink grid grid-cols-1 gap-3 border-b-2 py-5 md:grid-cols-[190px_1fr] md:gap-7 md:py-6 lg:grid-cols-[220px_1fr]"
                >
                  <div>
                    <b>{periodLabels[i]}</b>
                    <p
                      className={`border-ink mt-3 block w-fit border-2 px-2 py-1 text-[8px] md:mt-4 md:px-5 md:py-2 md:text-[10px] ${i === 0 ? 'bg-yellow' : 'bg-blue'}`}
                    >
                      {employmentTypes[i]}
                    </p>
                    <p className="text-faint mt-0 text-[8px] md:mt-1 md:text-[10px]">
                      {experienceLocations[i]}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-display m-0 text-[16px] md:text-[22px]">
                      {roles[i].toUpperCase()}
                    </h3>
                    <p className="text-dim m-0 text-[11px] tracking-widest">
                      {experienceContexts[i]}
                    </p>
                    <ul className="font-body space-y-2 pl-0 text-[10px] md:pl-5 md:text-[11px] lg:text-[12.5px]">
                      {bullets[i].slice(0, 3).map((b, j) => (
                        <li key={j}>
                          → <b>{b.head}</b> {b.text}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 flex flex-wrap gap-1 md:mt-4 md:gap-2">
                      {job.techs.map((x) => (
                        <span
                          key={x}
                          className="border-ink border px-1.5 py-0.5 text-[7px] md:px-3 md:py-1 md:text-[9px]"
                        >
                          {x}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
        {screen === 'stack' && (
          <section
            id="stack"
            className="v2-screen mx-auto max-w-[1200px] px-5 py-10 lg:px-0"
          >
            <SectionTitle
              index={v2.sections.stack.index}
              title={v2.sections.stack.title}
              subtitle={v2.sections.stack.subtitle}
            />
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:mt-8 lg:gap-5">
              {tools.slice(0, 4).map((name, i) => (
                <SkillCard
                  key={name}
                  name={name}
                  items={toolItems[i]}
                  index={i}
                />
              ))}
            </div>
          </section>
        )}
        {screen === 'academics' && (
          <section
            id="academics"
            className="v2-screen mx-auto max-w-[1200px] px-5 py-10 lg:px-0"
          >
            <SectionTitle
              index={v2.sections.academics.index}
              title={v2.sections.academics.title}
              subtitle={v2.sections.academics.subtitle}
            />
            <p className="text-faint mt-5 mb-3 text-[9px] tracking-[.18em]">
              {v2.sections.academics.formalEducation}
            </p>
            <article className="v2-shadow border-ink bg-panel grid min-h-32 grid-cols-[1fr_112px] border-2 md:grid-cols-[1fr_190px]">
              <div className="p-5">
                <span className="border-ink bg-yellow border-2 px-5 py-2 text-[9px]">
                  {t('education.postgraduate.period')}
                </span>
                <h3 className="font-display mt-5 mb-0 text-2xl">
                  {t('education.postgraduate.degree')}
                </h3>
                <p className="text-faint mt-2 mb-0 text-[10px]">
                  {t('education.postgraduate.school')}
                </p>
              </div>
              <div className="border-ink bg-yellow flex flex-col items-center justify-center border-l-2 text-center">
                <span className="text-3xl">🎓</span>
                <b className="mt-2 text-[9px]">
                  {v2.sections.academics.previousDegree}
                  <br />
                  {t('education.degree')}
                  <br />
                  {t('education.degreeYear')}
                </b>
              </div>
            </article>
            <p className="text-faint mt-8 mb-3 text-[9px] tracking-[.18em]">
              {v2.sections.academics.certifications}
            </p>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
              {courses.slice(0, 6).map((c, i) => (
                <article
                  key={c.title}
                  className="v2-shadow border-ink bg-panel relative flex h-[126px] flex-col border-2 p-4"
                >
                  <span
                    className="border-ink absolute top-0 right-0 flex h-8 w-16 items-center justify-center border-b-2 border-l-2 text-[9px] font-bold"
                    style={{ background: accents[i % accents.length] }}
                  >
                    {c.year}
                  </span>
                  <span className="text-faint pr-16 text-[8px] tracking-[.12em]">
                    {c.issuer.toUpperCase()}
                  </span>
                  <h3 className="font-display my-3 text-base leading-tight">
                    {c.title}
                  </h3>
                  <div className="border-ink/30 mt-auto flex items-end justify-between border-t pt-3">
                    <span className="text-faint text-[7px] tracking-[.1em]">
                      {c.details}
                    </span>
                    <a
                      className="text-[8px] font-bold whitespace-nowrap underline"
                      href="#"
                    >
                      {v2.sections.academics.seeCertificate}
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
        {screen === 'projetos' && (
          <section
            id="projetos"
            className="v2-screen mx-auto max-w-[1200px] px-5 py-10 lg:px-0"
          >
            <SectionTitle
              index={v2.sections.projects.index}
              title={v2.sections.projects.title}
              subtitle={v2.sections.projects.subtitle}
            />
            <div className="mt-6 grid grid-cols-1 md:mt-8 md:grid-cols-2">
              {projectTitles.map((p, i) => (
                <ProjectCard
                  key={p}
                  title={p}
                  desc={projectDescriptions[i]}
                  index={i}
                />
              ))}
            </div>
          </section>
        )}
        {screen === 'contato' && (
          <section
            id="contato"
            className="v2-screen mx-auto max-w-[1200px] px-5 py-10 lg:px-0"
          >
            <SectionTitle
              index={v2.sections.contact.index}
              title={v2.sections.contact.title}
              subtitle={v2.sections.contact.subtitle}
            />
            <div className="mt-5 grid gap-8 md:grid-cols-[1fr_310px] lg:grid-cols-[1fr_380px]">
              <Contact links={site.hero.links} embedded />
              <aside className="space-y-4">
                <div className="v2-shadow border-ink bg-panel border-2">
                  <h3 className="font-display bg-ink text-paper m-0 px-5 py-3 text-lg">
                    {v2.contact.directChannels}
                  </h3>
                  <div className="p-5 text-[10px]">
                    {[
                      ['✉', v2.contact.labels.email, site.hero.links.email],
                      ['◎', v2.contact.labels.website, v2.identity.website],
                      [
                        '●',
                        v2.contact.labels.github,
                        site.hero.links.github.replace(/^https?:\/\//, ''),
                      ],
                      [
                        'in',
                        v2.contact.labels.linkedin,
                        site.hero.links.linkedin.replace(/^https?:\/\//, ''),
                      ],
                      ['⌖', v2.contact.labels.location, v2.contact.location],
                    ].map(([icon, label, value]) => (
                      <div
                        key={label}
                        className="border-ink/20 grid grid-cols-[24px_1fr] border-b py-2 last:border-0"
                      >
                        <b>{icon}</b>
                        <div>
                          <span className="text-faint block text-[7px] tracking-[.16em]">
                            {label}
                          </span>
                          <b>{value}</b>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="v2-shadow bg-paper border-2 border-[#4caf50] p-4">
                  <b className="text-[11px]">{v2.contact.openToWork}</b>
                  <p className="font-body mb-0 text-[10px] leading-relaxed">
                    {v2.contact.availabilityCopy}
                  </p>
                </div>
                <div className="v2-shadow border-ink bg-yellow grid grid-cols-[36px_1fr] items-center border-2 px-4 py-2">
                  <span className="text-xl">ϟ</span>
                  <div>
                    <b className="font-display block text-sm">
                      {v2.contact.responseTime}
                    </b>
                    <span className="text-[8px]">
                      {v2.contact.responseValue}
                    </span>
                  </div>
                </div>
              </aside>
            </div>
          </section>
        )}
      </motion.div>
      <nav className="border-ink bg-bg fixed inset-x-0 bottom-0 z-40 hidden h-[54px] grid-cols-6 border-t-2 lg:grid">
        {nav.map((id, i) => (
          <Link
            key={id}
            href={routes[id]}
            className={`border-ink flex items-center justify-center border-r text-center text-[9px] font-bold ${screen === id ? 'bg-ink text-yellow' : 'bg-paper text-ink'}`}
          >{`[0${i + 1} // ${navLabels[id]}]`}</Link>
        ))}
      </nav>
      <footer className="border-ink bg-paper fixed inset-x-0 bottom-0 z-40 lg:hidden">
        <nav className="border-ink grid h-12 grid-cols-3 items-center border-t-2 px-5 text-[8px] font-bold md:h-[54px] md:px-8 md:text-[10px]">
          <Link
            className="min-w-0 justify-self-start whitespace-nowrap"
            href={routes[previous]}
          >
            ← {navLabels[previous]}
          </Link>
          <span className="text-faint justify-self-center whitespace-nowrap">
            [ 0{screenIndex + 1} / 06 ]
          </span>
          <Link
            className="min-w-0 justify-self-end text-right whitespace-nowrap"
            href={routes[next]}
          >
            {navLabels[next]} →
          </Link>
        </nav>
        <div className="border-ink flex h-9 items-center justify-between border-t px-5 text-[8px] md:h-10 md:px-8">
          <span>{v2.global.copyright}</span>
          <span className="text-faint hidden md:inline">
            {v2.global.portfolioSystem}
          </span>
          <span className="text-[#357a38]">{v2.global.available}</span>
        </div>
      </footer>
    </main>
  );
}
