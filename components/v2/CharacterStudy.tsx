'use client';

import Link from 'next/link';
import { CharacterViewer } from '@/components/three/CharacterViewer';
import { Header, PaintSplashes } from './PortfolioV2';
import type { SiteContent } from '@/lib/cms/transform';

export function CharacterStudy({ site }: { site: SiteContent }) {
  return (
    <main className="min-h-screen pb-16">
      <Header links={site.hero.links} />
      <section className="mx-auto grid max-w-[1600px] md:grid-cols-[165px_1fr] lg:grid-cols-[165px_1fr_320px]">
        <aside className="border-ink hidden border-r-2 px-4 py-12 md:block">
          <div className="text-faint text-7xl">♕</div>
          <PaintSplashes />
          <p className="text-faint mt-20 text-[11px] leading-10">
            → observe
            <br />
            build →<br />↗ iterate
          </p>
        </aside>
        <div className="px-5 py-10 md:px-12">
          <p className="text-faint text-[10px]">[07] ———————</p>
          <h1 className="font-display border-ink mb-8 border-b-2 pb-5 text-[clamp(48px,6vw,82px)] leading-none">
            CHARACTER STUDY
          </h1>
          <div className="v2-shadow border-ink bg-panel relative mx-auto h-[620px] max-w-[740px] overflow-hidden border-2 max-sm:h-[520px]">
            <CharacterViewer />
            <div className="bg-ink text-yellow absolute inset-x-0 bottom-0 flex justify-between px-5 py-4 text-[9px] font-bold">
              <span>FIG.07 — J.BOTELHO // DIGITAL TWIN</span>
              <span>GLB / REAL-TIME</span>
            </div>
          </div>
        </div>
        <aside className="border-ink bg-panel border-l-2 p-6">
          <h2 className="font-display bg-ink text-paper -mx-6 -mt-6 px-6 py-5 text-center text-xl">
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
            <div key={k} className="border-ink/25 border-b py-5">
              <span className="text-faint text-[8px]">{k}</span>
              <p className="font-display m-0 mt-2 text-xl">{v}</p>
            </div>
          ))}
          <div className="border-green mt-8 border-2 p-4 text-[10px] font-bold">
            ● MODEL READY
          </div>
          <Link
            href="/"
            className="bg-ink text-yellow mt-4 block px-5 py-4 text-center text-[10px] font-bold"
          >
            ← RETURN TO PORTFOLIO
          </Link>
        </aside>
      </section>
    </main>
  );
}
