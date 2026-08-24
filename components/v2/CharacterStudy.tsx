'use client';

import Link from 'next/link';
import { CharacterViewer } from '@/components/three/CharacterViewer';
import { Header } from './PortfolioV2';
import type { SiteContent } from '@/lib/cms/transform';

export function CharacterStudy({ site }: { site: SiteContent }) {
  return (
    <main className="min-h-screen pb-16">
      <Header links={site.hero.links} />
      <section className="mx-auto grid max-w-[1200px] gap-8 px-5 py-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:px-0">
        <div
          data-testid="character-heading"
          className="border-ink border-b-2 pb-5 lg:col-span-2"
        >
          <Link href="/" className="text-[9px] font-bold underline">
            ← [01] OVERVIEW / CHARACTER STUDY
          </Link>
          <h1 className="font-display mt-5 mb-0 text-[clamp(48px,6vw,82px)] leading-none">
            CHARACTER STUDY
          </h1>
        </div>
        <div data-testid="character-viewer-column">
          <div className="v2-shadow border-ink bg-paper relative mx-auto h-[620px] max-w-[740px] overflow-hidden border-2 max-sm:h-[520px]">
            <CharacterViewer />
            <div className="bg-ink text-yellow absolute inset-x-0 bottom-0 flex justify-between px-5 py-4 text-[9px] font-bold">
              <span>FIG.07 — J.BOTELHO // DIGITAL TWIN</span>
              <span>GLB / REAL-TIME</span>
            </div>
          </div>
        </div>
        <aside
          data-testid="character-specification"
          className="border-ink bg-paper self-start border-2 p-4"
        >
          <h2 className="font-display bg-ink text-paper -mx-4 -mt-4 px-4 py-3 text-center text-sm">
            DIGITAL CHARACTER SPECIFICATION
          </h2>
          {[
            ['FORMAT', 'GLB / GLTF 2.0'],
            ['RENDERER', 'THREE.JS · R3F'],
            ['FRAMING', 'HEAD · SHOULDERS · CHEST'],
            ['INTERACTION', 'CURSOR REACTIVE'],
            ['MOTION', 'REDUCED-MOTION READY'],
            ['BACKGROUND', 'TRANSPARENT WEBGL'],
          ].map(([k, v]) => (
            <div key={k} className="border-ink/25 border-b py-2">
              <span className="text-faint text-[7px]">{k}</span>
              <p className="font-display m-0 mt-1 text-sm">{v}</p>
            </div>
          ))}
          <div className="border-green mt-4 border-2 p-3 text-[9px] font-bold">
            ● MODEL READY
          </div>
          <Link
            href="/"
            className="bg-ink text-yellow mt-3 block px-4 py-3 text-center text-[9px] font-bold"
          >
            ← RETURN TO PORTFOLIO
          </Link>
        </aside>
      </section>
    </main>
  );
}
