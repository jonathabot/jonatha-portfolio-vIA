'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { CharacterViewer } from '@/components/three/CharacterViewer';
import { Header } from './PortfolioV2';
import type { Messages, SiteContent } from '@/lib/cms/transform';

export function CharacterStudy({ site }: { site: SiteContent }) {
  const t = useTranslations();
  const v2 = t.raw('v2') as Messages['v2'];
  return (
    <main className="min-h-screen pb-16">
      <Header links={site.hero.links} />
      <section className="mx-auto grid max-w-[1200px] gap-8 px-5 py-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:px-0">
        <div
          data-testid="character-heading"
          className="border-ink border-b-2 pb-5 lg:col-span-2"
        >
          <Link href="/" className="text-[9px] font-bold underline">
            {v2.characterStudy.breadcrumb}
          </Link>
          <h1 className="font-display mt-5 mb-0 text-[clamp(48px,6vw,82px)] leading-none">
            {v2.characterStudy.title}
          </h1>
        </div>
        <div data-testid="character-viewer-column">
          <div className="v2-shadow border-ink bg-paper relative mx-auto h-[620px] max-w-[740px] overflow-hidden border-2 max-sm:h-[520px]">
            <CharacterViewer />
            <div className="bg-ink text-yellow absolute inset-x-0 bottom-0 flex justify-between px-5 py-4 text-[9px] font-bold">
              <span>{v2.characterStudy.figure}</span>
              <span>{v2.characterStudy.formatLabel}</span>
            </div>
          </div>
        </div>
        <aside
          data-testid="character-specification"
          className="border-ink bg-paper self-start border-2 p-4"
        >
          <h2 className="font-display bg-ink text-paper -mx-4 -mt-4 px-4 py-3 text-center text-sm">
            {v2.characterStudy.specificationTitle}
          </h2>
          {v2.characterStudy.specifications.map(({ label, value }) => (
            <div key={label} className="border-ink/25 border-b py-2">
              <span className="text-faint text-[7px]">{label}</span>
              <p className="font-display m-0 mt-1 text-sm">{value}</p>
            </div>
          ))}
          <div className="border-green mt-4 border-2 p-3 text-[9px] font-bold">
            {v2.characterStudy.modelReady}
          </div>
          <Link
            href="/"
            className="bg-ink text-yellow mt-3 block px-4 py-3 text-center text-[9px] font-bold"
          >
            {v2.characterStudy.return}
          </Link>
        </aside>
      </section>
    </main>
  );
}
