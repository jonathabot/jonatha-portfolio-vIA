'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef } from 'react';
import { parseSummary } from '@/lib/cms/summary';
import { useTypewriter } from '@/components/hooks/useTypewriter';
import { useSweep } from '@/components/hooks/useSweep';
import { Chip } from '@/components/ui/Chip';
import { TextLink } from '@/components/ui/TextLink';
import { LinkedInIcon } from '@/components/ui/icons/LinkedInIcon';
import { GitHubIcon } from '@/components/ui/icons/GitHubIcon';
import type { SiteContent } from '@/lib/cms/transform';

const FULL_NAME = 'JONATHA BOTELHO';

export function Hero({
  techs,
  links,
  photoUrl,
  showPhoto,
}: SiteContent['hero'] & { showPhoto: boolean }) {
  const t = useTranslations('hero');
  const typed = useTypewriter(FULL_NAME);
  const sweep = useSweep();
  const cursorRef = useRef<HTMLSpanElement>(null);
  const highlightRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const segments = useMemo(() => parseSummary(t('summary')), [t]);

  // Blink the cursor.
  useEffect(() => {
    const el = cursorRef.current;
    if (!el) return;
    const anim = el.animate(
      [
        { opacity: 1, offset: 0 },
        { opacity: 1, offset: 0.5 },
        { opacity: 0, offset: 0.5 },
        { opacity: 0, offset: 1 },
      ],
      { duration: 1000, iterations: Infinity },
    );
    return () => anim.cancel();
  }, []);

  // Run the highlight sweep once, after mount.
  useEffect(() => {
    highlightRefs.current.forEach((el, i) => sweep(el, i));
  }, [sweep]);

  return (
    <div className="flex flex-wrap items-center gap-12 border-b-[3px] border-double border-ink pt-16 pb-[52px]">
      <div className="min-w-[380px] flex-1">
        <p className="m-0 mb-2 text-[14px] text-dim">{t('hello')}</p>
        <h1 className="m-0 text-[38px] leading-[1.2] font-bold">
          {typed}
          <span ref={cursorRef} className="font-normal">
            _
          </span>
        </h1>
        <p className="mt-[10px] text-[16px] text-body">{t('role')}</p>
        <p className="mt-5 text-[16px] leading-[1.7]">
          {segments.map((seg, i) => {
            if (!seg.highlight) return <span key={i}>{seg.text}</span>;
            // Highlight index = how many highlighted segments precede this one.
            const idx = segments.slice(0, i).filter((s) => s.highlight).length;
            return (
              <span
                key={i}
                ref={(el) => {
                  highlightRefs.current[idx] = el;
                }}
                className="px-[6px] text-ink"
                style={{
                  backgroundImage: 'linear-gradient(var(--ink),var(--ink))',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '0% 100%',
                }}
              >
                {seg.text}
              </span>
            );
          })}
        </p>
        <div className="mt-[22px] flex flex-wrap gap-2">
          {techs.map((tech) => (
            <Chip key={tech} variant="ink">
              {tech}
            </Chip>
          ))}
        </div>
        <div className="mt-7 flex flex-wrap items-center gap-6">
          <a
            href="#contato"
            className="bg-ink px-5 py-[10px] text-[14px] font-bold text-bg no-underline"
          >
            {t('cta')} →
          </a>
          <TextLink
            href={links.linkedin}
            target="_blank"
            className="inline-flex items-center gap-[6px] text-[14px]"
          >
            <LinkedInIcon size={16} />
            /linkedin
          </TextLink>
          <TextLink
            href={links.github}
            target="_blank"
            className="inline-flex items-center gap-[6px] text-[14px]"
          >
            <GitHubIcon size={16} />
            /github
          </TextLink>
        </div>
      </div>
      {showPhoto && photoUrl && (
        <div className="h-[240px] w-[240px] flex-none border border-ink shadow-[10px_10px_0_var(--ink)] [filter:grayscale(1)_contrast(1.05)]">
          <Image
            src={photoUrl}
            alt="Jonatha Botelho"
            width={240}
            height={240}
            className="h-full w-full object-cover"
          />
        </div>
      )}
    </div>
  );
}
