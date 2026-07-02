# Portfólio Jonatha Botelho v2 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page bilingual (PT/EN) terminal/monospace portfolio in Next.js, statically generated, whose content comes at build-time from a homegrown Google-Sheets/AppSheet/Apps-Script CMS (with a committed `fallback.json`), matching the high-fidelity design handoff pixel-for-pixel.

**Architecture:** Next.js 16 App Router, SSG. A Server Component (`page.tsx`) calls `getContent()` once at build, which fetches the CMS JSON (or falls back to a committed file), validates it with Zod, and transforms it into next-intl `messages` (pt/en) + neutral `content`. Client components render the sections; Zustand holds `theme`/`lang`; both message trees ship in the payload so the PT/EN toggle needs no refetch. Visual tokens are CSS custom properties swapped by `[data-theme]`.

**Tech Stack:** Next.js 16, React 19, TypeScript (strict), Tailwind CSS v4, next-intl 4, Zustand 5, Zod 4, React Hook Form 7, @hookform/resolvers 5, Resend 6, Vitest 4, @playwright/test 1.6x, pnpm.

## Global Constraints

- **Package manager:** pnpm. All install/run commands use `pnpm`.
- **TypeScript:** `strict: true`. No `any` in committed code (test mocks may use `unknown`/casts).
- **Design source of truth:** `design_handoff_portfolio_v2/README.md` + prototype `design_handoff_portfolio_v2/design/Jonatha Botelho - Portfolio v2.dc.html`. All copy (PT/EN) is **verbatim** from the prototype's `strings()`.
- **Design spec:** `docs/superpowers/specs/2026-07-02-portfolio-v2-design.md` — authoritative for tokens, spacing, type scale, section layout.
- **Zero border-radius** everywhere. Only `body` background has a transition (`.25s`); text colors switch instantly.
- **Font:** Courier Prime (weights 400, 700; italic 400) via `next/font/google`, applied to everything incl. inputs/buttons.
- **Colors** are CSS custom properties, light in `:root`, dark in `:root[data-theme="dark"]` — exact hex values from the spec's token table.
- **Content model:** translatable fields use `Loc<T> = { pt: T; en: T }`. The site consumes the CMS **only at build-time** (no client runtime fetch). `fallback.json` is the single committed content source and must let the site run with **no** CMS env vars set.
- **i18n keys:** `messages.pt` and `messages.en` must always have an identical key set.
- **Commits:** conventional commits, frequent (one per task minimum). End every commit message with a trailing line: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
- **Existing repo state:** git is already initialized; `design_handoff_portfolio_v2/`, `docs/`, `.gitignore` are committed. The Next.js app is scaffolded **into the repo root** (this directory), not a subfolder.

---

## File Structure

```
app/
  layout.tsx            # <html>, Courier Prime, anti-flash inline script, metadata/OG
  page.tsx              # Server Component: getContent() → IntlProvider + sections
  globals.css           # Tailwind v4 import, @theme tokens, [data-theme] overrides
  api/contact/route.ts  # POST → validate (Zod) → send (Resend)
components/
  providers/IntlProvider.tsx     # receives {pt,en}; reads lang from store → NextIntlClientProvider
  layout/Header.tsx / Footer.tsx
  sections/Hero.tsx Now.tsx Tools.tsx Experience.tsx Projects.tsx Education.tsx Contact.tsx
  ui/SectionHeading.tsx Chip.tsx TextLink.tsx
  ui/icons/LinkedInIcon.tsx GitHubIcon.tsx
  hooks/useTypewriter.ts useSweep.ts useHasMounted.ts
store/ui-store.ts       # Zustand: theme, lang (+ persist)
lib/
  duration.ts           # calcDuration(startISO, endISO|null, lang)
  month.ts              # formatMonthYear(iso, lang)
  contact-schema.ts     # Zod schema for the contact form
  cms/schema.ts         # Zod: Loc, PortfolioContent
  cms/summary.ts        # parseSummary("...[[x]]...") → segments
  cms/transform.ts      # PortfolioContent → { messages:{pt,en}, content }
  cms/fetch.ts          # getContent(): build-time fetch + fallback + validate
  cms/types.ts          # inferred TS types (re-exports)
content/fallback.json   # last-known-good CMS payload (verbatim from prototype)
apps-script/Code.gs     # reference doGet (NOT part of the site build)
public/favicon.svg public/images/profile-pic.png
__tests__/…             # Vitest
e2e/smoke.spec.ts       # Playwright
.env.example  README.md
```

---

## Task 1: Scaffold Next.js app + tooling

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `.prettierrc.json`, `.prettierignore`, `vitest.config.ts`, `vitest.setup.ts`, `playwright.config.ts`, `.env.example`
- Create: `app/layout.tsx`, `app/page.tsx`, `app/globals.css` (temporary minimal versions)
- Modify: `.gitignore` (already present — verify Next entries exist; they do)

**Interfaces:**
- Produces: a running `pnpm dev`, `pnpm build`, `pnpm test`, `pnpm test:e2e`, `pnpm lint` toolchain. No app-specific exports yet.

- [ ] **Step 1: Scaffold with create-next-app into the repo root**

The repo root already has files (`docs/`, `design_handoff_portfolio_v2/`, `.gitignore`). `create-next-app .` refuses a non-empty dir, so scaffold in a temp dir and move in.

```bash
cd "$(git rev-parse --show-toplevel)"
pnpm dlx create-next-app@latest .scaffold \
  --ts --tailwind --eslint --app --src-dir=false \
  --import-alias "@/*" --use-pnpm --no-turbopack --disable-git
# move generated files into repo root without clobbering existing dirs
cp -r .scaffold/app .scaffold/public ./ 2>/dev/null || true
cp .scaffold/package.json .scaffold/tsconfig.json .scaffold/next.config.* \
   .scaffold/postcss.config.* .scaffold/eslint.config.* .scaffold/next-env.d.ts ./
rm -rf .scaffold
```

If `create-next-app` flags differ in this version, accept its interactive defaults matching: TypeScript yes, Tailwind yes, ESLint yes, App Router yes, `src/` no, import alias `@/*`, Turbopack no.

- [ ] **Step 2: Pin runtime + dev dependencies**

```bash
pnpm add next-intl@^4 zustand@^5 zod@^4 react-hook-form@^7 @hookform/resolvers@^5 resend@^6
pnpm add -D vitest@^4 @vitejs/plugin-react@^6 jsdom @testing-library/react @testing-library/jest-dom @playwright/test@^1 prettier prettier-plugin-tailwindcss
pnpm exec playwright install chromium
```

- [ ] **Step 3: Configure Vitest**

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['__tests__/**/*.test.{ts,tsx}'],
  },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./', import.meta.url)) },
  },
});
```

Create `vitest.setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 4: Configure Prettier**

Create `.prettierrc.json`:

```json
{
  "singleQuote": true,
  "semi": true,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

Create `.prettierignore`:

```
.next
node_modules
pnpm-lock.yaml
content/fallback.json
design_handoff_portfolio_v2
```

- [ ] **Step 5: Configure Playwright**

Create `playwright.config.ts`:

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  webServer: {
    command: 'pnpm build && pnpm start -p 3100',
    url: 'http://localhost:3100',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  use: { baseURL: 'http://localhost:3100' },
});
```

- [ ] **Step 6: Add scripts to package.json**

Ensure the `scripts` block contains:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "format": "prettier --write .",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  }
}
```

- [ ] **Step 7: Create `.env.example`**

```bash
# Contact form (Resend)
RESEND_API_KEY=
CONTACT_TO_EMAIL=jonathabotelho1@gmail.com

# CMS (build-time). Leave empty to use content/fallback.json.
CMS_ENDPOINT_URL=
CMS_TOKEN=
```

- [ ] **Step 8: Verify toolchain builds**

```bash
pnpm build
pnpm test   # no tests yet → Vitest exits 0 with "no test files" OR add a trivial passing test if it errors
```
Expected: `pnpm build` succeeds (default scaffold page). If `vitest run` errors on no files, add `passWithNoTests: true` to `vitest.config.ts` `test`.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js 16 app with tooling (vitest, playwright, prettier)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: Design tokens & global CSS

**Files:**
- Modify: `app/globals.css`

**Interfaces:**
- Produces: CSS custom properties `--bg --ink --body --dim --faint --idle --hair` (light + dark) and Tailwind theme utilities `bg-bg text-ink text-body text-dim text-faint text-idle border-ink border-faint bg-hair`. Consumed by every component.

- [ ] **Step 1: Write `app/globals.css`**

Replace the scaffold contents entirely:

```css
@import 'tailwindcss';

:root {
  --bg: #ffffff;
  --ink: #111111;
  --body: #444444;
  --dim: #666666;
  --faint: #999999;
  --idle: #bbbbbb;
  --hair: #cccccc;
}
:root[data-theme='dark'] {
  --bg: #0d0d0d;
  --ink: #ececec;
  --body: #b0b0b0;
  --dim: #8f8f8f;
  --faint: #6f6f6f;
  --idle: #555555;
  --hair: #3a3a3a;
}

@theme inline {
  --color-bg: var(--bg);
  --color-ink: var(--ink);
  --color-body: var(--body);
  --color-dim: var(--dim);
  --color-faint: var(--faint);
  --color-idle: var(--idle);
  --color-hair: var(--hair);
  --radius: 0px;
}

* {
  border-radius: 0 !important;
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--ink);
  transition: background 0.25s;
}
```

- [ ] **Step 2: Verify utilities compile**

Temporarily set `app/page.tsx` body to `<main className="bg-bg text-ink"><p className="text-body border border-faint">x</p></main>` and run:

```bash
pnpm build
```
Expected: build succeeds, no "unknown utility" errors. Revert the temp page change after.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "style: add terminal design tokens and theme utilities

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: Zustand UI store (theme + lang)

**Files:**
- Create: `store/ui-store.ts`
- Test: `__tests__/store/ui-store.test.ts`

**Interfaces:**
- Produces:
  - `type Theme = 'light' | 'dark'`, `type Lang = 'pt' | 'en'`
  - `useUIStore` (zustand hook) with state `{ theme: Theme; lang: Lang }` and actions `setTheme(t: Theme): void`, `toggleTheme(): void`, `setLang(l: Lang): void`.
  - `applyThemeAttr(theme: Theme): void` — sets `document.documentElement.dataset.theme`.
  - Persist keys: `jb-portfolio-theme` / `jb-portfolio-lang` via a single persisted store named `jb-portfolio-ui` OR two stores. Use one persisted store `jb-portfolio-ui` persisting `{theme, lang}`; the anti-flash script (Task 4) reads the same localStorage entry.
- Consumed by: Header, IntlProvider, Hero.

> Note: to keep the anti-flash inline script trivial, persist theme+lang under localStorage key `jb-portfolio-ui` as JSON `{"state":{"theme":"...","lang":"..."},"version":0}` (zustand/persist default shape). The inline script parses that. Defaults: theme `light`, lang `pt`.

- [ ] **Step 1: Write the failing test**

```ts
// __tests__/store/ui-store.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from '@/store/ui-store';

describe('useUIStore', () => {
  beforeEach(() => {
    useUIStore.setState({ theme: 'light', lang: 'pt' });
  });

  it('defaults to light + pt', () => {
    expect(useUIStore.getState().theme).toBe('light');
    expect(useUIStore.getState().lang).toBe('pt');
  });

  it('toggleTheme flips light↔dark', () => {
    useUIStore.getState().toggleTheme();
    expect(useUIStore.getState().theme).toBe('dark');
    useUIStore.getState().toggleTheme();
    expect(useUIStore.getState().theme).toBe('light');
  });

  it('setLang updates language', () => {
    useUIStore.getState().setLang('en');
    expect(useUIStore.getState().lang).toBe('en');
  });

  it('setTheme sets the html data-theme attribute', () => {
    useUIStore.getState().setTheme('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- ui-store`
Expected: FAIL — cannot find module `@/store/ui-store`.

- [ ] **Step 3: Implement the store**

```ts
// store/ui-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark';
export type Lang = 'pt' | 'en';

export function applyThemeAttr(theme: Theme): void {
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.theme = theme;
  }
}

type UIState = {
  theme: Theme;
  lang: Lang;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  setLang: (l: Lang) => void;
};

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      lang: 'pt',
      setTheme: (t) => {
        applyThemeAttr(t);
        set({ theme: t });
      },
      toggleTheme: () => get().setTheme(get().theme === 'dark' ? 'light' : 'dark'),
      setLang: (l) => set({ lang: l }),
    }),
    {
      name: 'jb-portfolio-ui',
      partialize: (s) => ({ theme: s.theme, lang: s.lang }),
      onRehydrateStorage: () => (state) => {
        if (state) applyThemeAttr(state.theme);
      },
    },
  ),
);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- ui-store`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add store/ui-store.ts __tests__/store/ui-store.test.ts
git commit -m "feat: add Zustand UI store for theme and language

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: Root layout, fonts, anti-flash script, metadata

**Files:**
- Modify: `app/layout.tsx`
- Create: `public/favicon.svg` (port), `public/images/profile-pic.png` (port)

**Interfaces:**
- Consumes: `app/globals.css`.
- Produces: `<html>` with `lang` (static `pt`; the client store drives visible language), Courier Prime font var applied to `<body>`, an inline `<script>` in `<head>` that sets `data-theme` before paint, and exported `metadata`.

- [ ] **Step 1: Port assets**

```bash
mkdir -p public/images
cp "design_handoff_portfolio_v2/design/favicon.svg" public/favicon.svg
cp "design_handoff_portfolio_v2/design/public/images/profile-pic.png" public/images/profile-pic.png
```

- [ ] **Step 2: Write `app/layout.tsx`**

```tsx
import type { Metadata } from 'next';
import { Courier_Prime } from 'next/font/google';
import './globals.css';

const courier = Courier_Prime({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-courier',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Jonatha Botelho — Desenvolvedor Google Cloud & Workspace',
  description:
    'Portfólio de Jonatha Botelho — Desenvolvedor Google Cloud & Google Workspace | Analista de Dados. Apps Script, AppSheet, BigQuery, Looker Studio, Cloud Run, React.',
  authors: [{ name: 'Jonatha Botelho' }],
  icons: { icon: '/favicon.svg' },
  openGraph: {
    title: 'Jonatha Botelho — Desenvolvedor Google Cloud & Workspace',
    description:
      'Automação de processos, dados e front-end. Apps Script, AppSheet, BigQuery, Looker Studio, Cloud Run, React.',
    type: 'website',
  },
};

const themeScript = `(function(){try{var s=localStorage.getItem('jb-portfolio-ui');var t=s?JSON.parse(s).state.theme:null;if(t!=='dark'&&t!=='light')t='light';document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='light';}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${courier.variable} bg-bg text-ink`}
        style={{ fontFamily: 'var(--font-courier), monospace' }}
      >
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Verify build + no theme flash**

```bash
pnpm build && pnpm start -p 3100 &
sleep 4 && curl -s http://localhost:3100 | grep -q "data-theme" && echo "FOUND inline theme wiring" ; kill %1
```
Expected: build succeeds; the served HTML contains the inline script. (Manual visual FOUC check happens in the Playwright task.)

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx public/favicon.svg public/images/profile-pic.png
git commit -m "feat: root layout with Courier Prime, anti-flash theme script, metadata

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: CMS contract schema (Zod) + types

**Files:**
- Create: `lib/cms/schema.ts`, `lib/cms/types.ts`
- Test: `__tests__/cms/schema.test.ts`

**Interfaces:**
- Produces:
  - `loc<T>(inner)` helper → `z.object({ pt: inner, en: inner })`.
  - `portfolioSchema` (Zod) matching the contract in the spec (`meta, flags, nav, hero, now, tools, experience, projects, education, form`).
  - Types: `PortfolioContent = z.infer<typeof portfolioSchema>`, `Loc<T>`, `Lang`.
- Consumed by: `fetch.ts`, `transform.ts`, tests.

- [ ] **Step 1: Write the failing test**

```ts
// __tests__/cms/schema.test.ts
import { describe, it, expect } from 'vitest';
import { portfolioSchema } from '@/lib/cms/schema';
import fallback from '@/content/fallback.json';

describe('portfolioSchema', () => {
  it('accepts the committed fallback.json', () => {
    expect(() => portfolioSchema.parse(fallback)).not.toThrow();
  });

  it('rejects a Loc field missing a language', () => {
    const bad = structuredClone(fallback) as any;
    bad.hero.role = { pt: 'só pt' }; // missing en
    expect(() => portfolioSchema.parse(bad)).toThrow();
  });

  it('rejects a non-ISO experience start date', () => {
    const bad = structuredClone(fallback) as any;
    bad.experience[0].start = 'ago 2024';
    expect(() => portfolioSchema.parse(bad)).toThrow();
  });
});
```

> This test depends on `content/fallback.json` (Task 6). Implement the schema first (Steps 3–4 make it importable); the fallback file is created in Task 6, at which point this test goes green. If executing strictly in order, temporarily create a minimal `content/fallback.json` stub that satisfies the schema now, then replace it with the full content in Task 6. **Simpler:** do Task 6 immediately after Step 4 here if working inline. For subagent execution, note the cross-dependency in the task handoff.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- cms/schema`
Expected: FAIL — cannot find `@/lib/cms/schema`.

- [ ] **Step 3: Implement `lib/cms/schema.ts`**

```ts
import { z } from 'zod';

export const loc = <T extends z.ZodTypeAny>(inner: T) =>
  z.object({ pt: inner, en: inner });

const locStr = loc(z.string());
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'expected YYYY-MM-DD');

export const portfolioSchema = z.object({
  meta: z.object({ nowUpdated: locStr, footer: locStr }),
  flags: z.object({ showEducation: z.boolean(), showPhoto: z.boolean() }),
  nav: z.object({ tools: locStr, exp: locStr, projects: locStr, contact: locStr }),
  hero: z.object({
    hello: locStr,
    role: locStr,
    summary: locStr,
    cta: locStr,
    techs: z.array(z.string()),
    links: z.object({ email: z.string(), linkedin: z.string(), github: z.string() }),
    photoUrl: z.string().nullable(),
  }),
  now: z.object({ items: z.array(locStr) }),
  tools: z.array(z.object({ name: locStr, items: locStr })),
  experience: z.array(
    z.object({
      company: z.string(),
      start: isoDate,
      end: isoDate.nullable(),
      role: locStr,
      techs: z.array(z.string()),
      bullets: z.array(z.object({ head: locStr, text: locStr })),
    }),
  ),
  projects: z.array(
    z.object({
      imageUrl: z.string().nullable(),
      repoUrl: z.string().nullable(),
      title: locStr,
      dateLabel: locStr,
      desc: locStr,
      stack: z.array(z.object({ k: locStr, v: locStr })),
    }),
  ),
  education: z.object({
    degree: locStr,
    school: locStr,
    degreeYear: locStr,
    langLine: locStr,
    langCert: locStr,
  }),
  form: z.object({
    name: locStr,
    email: locStr,
    message: locStr,
    send: locStr,
    cta: locStr,
  }),
});
```

Create `lib/cms/types.ts`:

```ts
import type { z } from 'zod';
import type { portfolioSchema } from './schema';

export type PortfolioContent = z.infer<typeof portfolioSchema>;
export type Lang = 'pt' | 'en';
export type Loc<T = string> = { pt: T; en: T };
```

Enable JSON imports in `tsconfig.json` if not already: ensure `"resolveJsonModule": true` under `compilerOptions`.

- [ ] **Step 4: Run test (will fail until fallback.json exists)**

Run: `pnpm test -- cms/schema`
Expected: FAIL if `content/fallback.json` absent → proceed to Task 6, then this passes. If you created a stub, PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/cms/schema.ts lib/cms/types.ts __tests__/cms/schema.test.ts tsconfig.json
git commit -m "feat: add Zod schema and types for CMS content contract

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 6: `content/fallback.json` (verbatim content)

**Files:**
- Create: `content/fallback.json`

**Interfaces:**
- Consumes: `portfolioSchema` shape (Task 5).
- Produces: the committed content payload used as build fallback + seed for all copy. Must `portfolioSchema.parse()` cleanly.

- [ ] **Step 1: Author `content/fallback.json` from the prototype**

Populate **every** field from the prototype's `strings()` dictionary (`design_handoff_portfolio_v2/design/Jonatha Botelho - Portfolio v2.dc.html`, lines ~357–502), copying PT and EN **verbatim**. Mapping rules:

- `meta.nowUpdated` ← `nowUpdated`; `meta.footer` ← `footer`.
- `flags` ← `{ "showEducation": true, "showPhoto": true }`.
- `nav.{tools,exp,projects,contact}` ← `navTools/navExp/navProjects/navContact`.
- `hero.hello/role/cta` ← `heroHello/role/heroCta`.
- `hero.summary` ← reconstruct the full sentence per language from `sum1..sum4`, inserting the three highlighted terms wrapped in `[[...]]` **in order**: `sum1 + "[[Google Workspace]]" + sum2 + "[[Apps Script]]" + sum3 + "[[React]]" + sum4`. Example (PT): `"Mais de 3 anos de experiência no desenvolvimento de soluções com Google Cloud e [[Google Workspace]]. Automação de processos com [[Apps Script]], desenvolvimento de aplicativos com AppSheet, dashboards com Looker Studio + BigQuery e serviços em Cloud Run. No front-end: [[React]], Next.js, TypeScript e Tailwind CSS. Fluxos de desenvolvimento assistidos por IA generativa aplicados em projetos profissionais."` (EN analogously from the EN `sum1..sum4`).
- `hero.techs` ← `heroTechs` array (`renderVals`, line ~511): `["Apps Script","AppSheet","BigQuery","Looker Studio","Cloud Run","React","TypeScript"]`.
- `hero.links` ← `{ "email": "jonathabotelho1@gmail.com", "linkedin": "https://linkedin.com/in/jonathabotelho", "github": "https://github.com/jonathabot" }`.
- `hero.photoUrl` ← `"/images/profile-pic.png"`.
- `now.items` ← array of `{pt,en}` from PT `nowItems` + EN `nowItems` (3 items, index-aligned).
- `tools` ← 5 entries; each `{ name:{pt,en}, items:{pt,en} }` from PT `tools[i].name/items` + EN `tools[i].name/items`.
- `experience` ← 2 entries. `company` from `job.company`; `role` `{pt,en}`; `techs` from `job.techs` (identical across langs — use either); `bullets[]` `{ head:{pt,en}, text:{pt,en} }`. **Dates (not in strings):** Gentrop `start:"2024-08-01", end:null`; Mundo Móveis `start:"2023-01-01", end:"2024-08-01"` (from the spec/`dur()` calls, prototype lines ~358–359).
- `projects` ← 3 entries in order Programatical → Stinx → jonatha-portfolio v1:
  - `title/desc` `{pt,en}` from `p0*/p1*/p2*`.
  - `dateLabel`: Programatical `{pt:"2025 · TCC", en:"2025 · Capstone"}`; Stinx `{pt:"2025 — presente", en:"2025 — present"}`; v1 `{pt:"2023", en:"2023"}`.
  - `stack`: Programatical ← `p0stack` `{k,v}` (PT+EN); Stinx ← `p1stack`; v1 ← the single inline line (prototype line ~177) `"Next.js · TypeScript · Tailwind CSS · Hygraph CMS · Framer Motion"` as one stack row `{ k:{pt:"Stack",en:"Stack"}, v:{pt:"Next.js · …", en:"Next.js · …"} }`.
  - `repoUrl`: Programatical `"https://github.com/jonathabot/programatical"`; Stinx `null`; v1 `"https://github.com/jonathabot/jonatha-portfolio"`.
  - `imageUrl`: all `null` (placeholders until real screenshots provided).
- `education` ← `{ degree, school, degreeYear, langLine, langCert }` each `{pt,en}` from the corresponding keys.
- `form` ← `{ name, email, message, send, cta }` each `{pt,en}` from `formName/formEmail/formMsg/formSend/cta`.

- [ ] **Step 2: Validate the file against the schema**

```bash
pnpm test -- cms/schema
```
Expected: PASS (3 tests) — confirms the file matches the contract.

- [ ] **Step 3: Commit**

```bash
git add content/fallback.json
git commit -m "feat: add fallback.json with verbatim PT/EN portfolio content

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 7: `parseSummary` (highlight markers)

**Files:**
- Create: `lib/cms/summary.ts`
- Test: `__tests__/cms/summary.test.ts`

**Interfaces:**
- Produces: `type SummarySegment = { text: string; highlight: boolean }`; `parseSummary(raw: string): SummarySegment[]`.
- Consumed by: `Hero`.

- [ ] **Step 1: Write the failing test**

```ts
// __tests__/cms/summary.test.ts
import { describe, it, expect } from 'vitest';
import { parseSummary } from '@/lib/cms/summary';

describe('parseSummary', () => {
  it('returns a single normal segment when there are no markers', () => {
    expect(parseSummary('plain text')).toEqual([{ text: 'plain text', highlight: false }]);
  });

  it('splits three [[...]] markers into alternating segments in order', () => {
    const out = parseSummary('a [[X]] b [[Y]] c [[Z]] d');
    expect(out).toEqual([
      { text: 'a ', highlight: false },
      { text: 'X', highlight: true },
      { text: ' b ', highlight: false },
      { text: 'Y', highlight: true },
      { text: ' c ', highlight: false },
      { text: 'Z', highlight: true },
      { text: ' d', highlight: false },
    ]);
  });

  it('drops empty leading/trailing normal segments', () => {
    expect(parseSummary('[[X]]')).toEqual([{ text: 'X', highlight: true }]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- cms/summary`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `lib/cms/summary.ts`**

```ts
export type SummarySegment = { text: string; highlight: boolean };

export function parseSummary(raw: string): SummarySegment[] {
  const parts = raw.split(/\[\[(.+?)\]\]/g); // odd indices = highlighted
  const segments: SummarySegment[] = [];
  parts.forEach((text, i) => {
    const highlight = i % 2 === 1;
    if (text === '' && !highlight) return; // drop empty normal gaps
    segments.push({ text, highlight });
  });
  return segments;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- cms/summary`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/cms/summary.ts __tests__/cms/summary.test.ts
git commit -m "feat: add summary highlight-marker parser

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 8: Duration + month formatting helpers

**Files:**
- Create: `lib/duration.ts`, `lib/month.ts`
- Test: `__tests__/lib/duration.test.ts`, `__tests__/lib/month.test.ts`

**Interfaces:**
- Produces:
  - `calcDuration(startISO: string, endISO: string | null, lang: Lang, now?: Date): string` — inclusive month count, PT `"1 ano e 11 meses"` / EN `"1 yr 11 mos"`. Mirrors prototype `dur()` (inclusive: `+1` month).
  - `formatMonthYear(iso: string, lang: Lang): string` — `"ago 2024"` / `"Aug 2024"` (lowercase 3-letter PT, capitalized 3-letter EN).
- Consumed by: `Experience`.

- [ ] **Step 1: Write failing tests**

```ts
// __tests__/lib/duration.test.ts
import { describe, it, expect } from 'vitest';
import { calcDuration } from '@/lib/duration';

const NOW = new Date('2026-07-15');

describe('calcDuration', () => {
  it('PT: years + months with pluralization', () => {
    expect(calcDuration('2024-08-01', null, 'pt', NOW)).toBe('1 ano e 11 meses');
  });
  it('EN: years + months abbreviated', () => {
    expect(calcDuration('2024-08-01', null, 'en', NOW)).toBe('1 yr 11 mos');
  });
  it('PT: months only', () => {
    expect(calcDuration('2026-05-01', '2026-07-01', 'pt', NOW)).toBe('3 meses');
  });
  it('PT: singular year and singular month', () => {
    expect(calcDuration('2023-01-01', '2024-01-01', 'pt', NOW)).toBe('1 ano e 1 mês');
  });
  it('fixed end date is honored (Mundo Móveis)', () => {
    expect(calcDuration('2023-01-01', '2024-08-01', 'pt', NOW)).toBe('1 ano e 8 meses');
  });
});
```

```ts
// __tests__/lib/month.test.ts
import { describe, it, expect } from 'vitest';
import { formatMonthYear } from '@/lib/month';

describe('formatMonthYear', () => {
  it('PT abbreviates lowercase', () => {
    expect(formatMonthYear('2024-08-01', 'pt')).toBe('ago 2024');
    expect(formatMonthYear('2023-01-01', 'pt')).toBe('jan 2023');
  });
  it('EN abbreviates capitalized', () => {
    expect(formatMonthYear('2024-08-01', 'en')).toBe('Aug 2024');
    expect(formatMonthYear('2023-01-01', 'en')).toBe('Jan 2023');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test -- duration month`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement `lib/duration.ts` and `lib/month.ts`**

```ts
// lib/duration.ts
import type { Lang } from '@/lib/cms/types';

export function calcDuration(
  startISO: string,
  endISO: string | null,
  lang: Lang,
  now: Date = new Date(),
): string {
  const s = new Date(startISO);
  const e = endISO ? new Date(endISO) : now;
  const months =
    (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth()) + 1; // inclusive
  const y = Math.floor(months / 12);
  const m = months % 12;
  const parts: string[] = [];
  if (lang === 'pt') {
    if (y > 0) parts.push(`${y} ${y > 1 ? 'anos' : 'ano'}`);
    if (m > 0) parts.push(`${m} ${m > 1 ? 'meses' : 'mês'}`);
    return parts.join(' e ');
  }
  if (y > 0) parts.push(`${y} ${y > 1 ? 'yrs' : 'yr'}`);
  if (m > 0) parts.push(`${m} ${m > 1 ? 'mos' : 'mo'}`);
  return parts.join(' ');
}
```

```ts
// lib/month.ts
import type { Lang } from '@/lib/cms/types';

const PT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatMonthYear(iso: string, lang: Lang): string {
  const d = new Date(iso);
  const table = lang === 'pt' ? PT : EN;
  return `${table[d.getMonth()]} ${d.getFullYear()}`;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test -- duration month`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/duration.ts lib/month.ts __tests__/lib/duration.test.ts __tests__/lib/month.test.ts
git commit -m "feat: add duration and month-year formatting helpers

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 9: CMS transform (JSON → messages + content)

**Files:**
- Create: `lib/cms/transform.ts`
- Test: `__tests__/cms/transform.test.ts`

**Interfaces:**
- Consumes: `PortfolioContent` (Task 5).
- Produces:
  - `type Messages` — per-language flattened i18n tree (see below).
  - `type SiteContent` — language-neutral data.
  - `transform(c: PortfolioContent): { messages: { pt: Messages; en: Messages }; content: SiteContent }`.
  - `pick<T>(loc: Loc<T>, lang: Lang): T` helper (exported).
- Consumed by: `page.tsx`, `IntlProvider`, sections.

**Messages shape (both languages identical keys):**
```
{
  meta: { nowUpdated, footer },
  nav: { tools, exp, projects, contact },
  hero: { hello, role, summary, cta },
  now: { items: string[] },
  tools: { names: string[], items: string[] },
  experience: { roles: string[], bullets: { head: string; text: string }[][] },
  projects: { titles: string[], dateLabels: string[], descs: string[], stacks: { k: string; v: string }[][] },
  education: { degree, school, degreeYear, langLine, langCert },
  form: { name, email, message, send, cta }
}
```

**SiteContent shape:**
```
{
  flags,
  hero: { techs, links, photoUrl },
  experience: { company, start, end, techs }[],
  projects: { imageUrl, repoUrl }[],
}
```

- [ ] **Step 1: Write the failing test**

```ts
// __tests__/cms/transform.test.ts
import { describe, it, expect } from 'vitest';
import { transform, pick } from '@/lib/cms/transform';
import { portfolioSchema } from '@/lib/cms/schema';
import fallback from '@/content/fallback.json';

const content = portfolioSchema.parse(fallback);

describe('transform', () => {
  const { messages, content: site } = transform(content);

  it('pt and en messages share the same top-level keys', () => {
    expect(Object.keys(messages.pt).sort()).toEqual(Object.keys(messages.en).sort());
  });

  it('flattens hero.role per language', () => {
    expect(messages.pt.hero.role).toBe(content.hero.role.pt);
    expect(messages.en.hero.role).toBe(content.hero.role.en);
  });

  it('keeps language-neutral data in content', () => {
    expect(site.hero.techs).toEqual(content.hero.techs);
    expect(site.experience[0].start).toBe(content.experience[0].start);
    expect(site.projects[0].repoUrl).toBe(content.projects[0].repoUrl);
  });

  it('does not leak Loc objects into content', () => {
    expect(JSON.stringify(site)).not.toContain('"pt":');
  });

  it('pick selects the active language', () => {
    expect(pick({ pt: 'a', en: 'b' }, 'en')).toBe('b');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- cms/transform`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `lib/cms/transform.ts`**

```ts
import type { Lang, Loc, PortfolioContent } from './types';

export const pick = <T,>(l: Loc<T>, lang: Lang): T => l[lang];

export type Messages = {
  meta: { nowUpdated: string; footer: string };
  nav: { tools: string; exp: string; projects: string; contact: string };
  hero: { hello: string; role: string; summary: string; cta: string };
  now: { items: string[] };
  tools: { names: string[]; items: string[] };
  experience: { roles: string[]; bullets: { head: string; text: string }[][] };
  projects: {
    titles: string[];
    dateLabels: string[];
    descs: string[];
    stacks: { k: string; v: string }[][];
  };
  education: {
    degree: string;
    school: string;
    degreeYear: string;
    langLine: string;
    langCert: string;
  };
  form: { name: string; email: string; message: string; send: string; cta: string };
};

export type SiteContent = {
  flags: PortfolioContent['flags'];
  hero: { techs: string[]; links: PortfolioContent['hero']['links']; photoUrl: string | null };
  experience: { company: string; start: string; end: string | null; techs: string[] }[];
  projects: { imageUrl: string | null; repoUrl: string | null }[];
};

function messagesFor(c: PortfolioContent, lang: Lang): Messages {
  const p = <T,>(l: Loc<T>) => pick(l, lang);
  return {
    meta: { nowUpdated: p(c.meta.nowUpdated), footer: p(c.meta.footer) },
    nav: {
      tools: p(c.nav.tools),
      exp: p(c.nav.exp),
      projects: p(c.nav.projects),
      contact: p(c.nav.contact),
    },
    hero: {
      hello: p(c.hero.hello),
      role: p(c.hero.role),
      summary: p(c.hero.summary),
      cta: p(c.hero.cta),
    },
    now: { items: c.now.items.map(p) },
    tools: { names: c.tools.map((t) => p(t.name)), items: c.tools.map((t) => p(t.items)) },
    experience: {
      roles: c.experience.map((e) => p(e.role)),
      bullets: c.experience.map((e) => e.bullets.map((b) => ({ head: p(b.head), text: p(b.text) }))),
    },
    projects: {
      titles: c.projects.map((x) => p(x.title)),
      dateLabels: c.projects.map((x) => p(x.dateLabel)),
      descs: c.projects.map((x) => p(x.desc)),
      stacks: c.projects.map((x) => x.stack.map((s) => ({ k: p(s.k), v: p(s.v) }))),
    },
    education: {
      degree: p(c.education.degree),
      school: p(c.education.school),
      degreeYear: p(c.education.degreeYear),
      langLine: p(c.education.langLine),
      langCert: p(c.education.langCert),
    },
    form: {
      name: p(c.form.name),
      email: p(c.form.email),
      message: p(c.form.message),
      send: p(c.form.send),
      cta: p(c.form.cta),
    },
  };
}

export function transform(c: PortfolioContent): {
  messages: { pt: Messages; en: Messages };
  content: SiteContent;
} {
  return {
    messages: { pt: messagesFor(c, 'pt'), en: messagesFor(c, 'en') },
    content: {
      flags: c.flags,
      hero: { techs: c.hero.techs, links: c.hero.links, photoUrl: c.hero.photoUrl },
      experience: c.experience.map((e) => ({
        company: e.company,
        start: e.start,
        end: e.end,
        techs: e.techs,
      })),
      projects: c.projects.map((x) => ({ imageUrl: x.imageUrl, repoUrl: x.repoUrl })),
    },
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- cms/transform`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/cms/transform.ts __tests__/cms/transform.test.ts
git commit -m "feat: transform CMS content into i18n messages and neutral content

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 10: `getContent()` build-time fetch + fallback

**Files:**
- Create: `lib/cms/fetch.ts`
- Test: `__tests__/cms/fetch.test.ts`

**Interfaces:**
- Consumes: `portfolioSchema`, `content/fallback.json`.
- Produces: `getContent(): Promise<PortfolioContent>` — fetches `CMS_ENDPOINT_URL` (with optional `?token=CMS_TOKEN`), 5s timeout, validates; on any failure or missing env, returns the validated `fallback.json`.
- Consumed by: `page.tsx`.

- [ ] **Step 1: Write the failing test**

```ts
// __tests__/cms/fetch.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fallback from '@/content/fallback.json';

describe('getContent', () => {
  beforeEach(() => vi.resetModules());
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('returns fallback when CMS_ENDPOINT_URL is unset', async () => {
    vi.stubEnv('CMS_ENDPOINT_URL', '');
    const { getContent } = await import('@/lib/cms/fetch');
    const c = await getContent();
    expect(c.hero.role.pt).toBe((fallback as any).hero.role.pt);
  });

  it('uses the endpoint response when it is valid', async () => {
    vi.stubEnv('CMS_ENDPOINT_URL', 'https://cms.example/exec');
    const custom = structuredClone(fallback) as any;
    custom.hero.role.pt = 'CUSTOM ROLE';
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify(custom), { status: 200 })),
    );
    const { getContent } = await import('@/lib/cms/fetch');
    const c = await getContent();
    expect(c.hero.role.pt).toBe('CUSTOM ROLE');
  });

  it('falls back when the endpoint returns 500', async () => {
    vi.stubEnv('CMS_ENDPOINT_URL', 'https://cms.example/exec');
    vi.stubGlobal('fetch', vi.fn(async () => new Response('boom', { status: 500 })));
    const { getContent } = await import('@/lib/cms/fetch');
    const c = await getContent();
    expect(c.hero.role.pt).toBe((fallback as any).hero.role.pt);
  });

  it('falls back when the endpoint returns invalid JSON shape', async () => {
    vi.stubEnv('CMS_ENDPOINT_URL', 'https://cms.example/exec');
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ nope: true }), { status: 200 })),
    );
    const { getContent } = await import('@/lib/cms/fetch');
    const c = await getContent();
    expect(c.hero.role.pt).toBe((fallback as any).hero.role.pt);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- cms/fetch`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `lib/cms/fetch.ts`**

```ts
import { portfolioSchema } from './schema';
import type { PortfolioContent } from './types';
import fallback from '@/content/fallback.json';

export async function getContent(): Promise<PortfolioContent> {
  const base = process.env.CMS_ENDPOINT_URL;
  if (!base) return portfolioSchema.parse(fallback);

  try {
    const token = process.env.CMS_TOKEN;
    const url = token ? `${base}?token=${encodeURIComponent(token)}` : base;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(5000),
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`CMS responded ${res.status}`);
    return portfolioSchema.parse(await res.json());
  } catch (err) {
    console.warn('[cms] using fallback.json:', (err as Error).message);
    return portfolioSchema.parse(fallback);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- cms/fetch`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/cms/fetch.ts __tests__/cms/fetch.test.ts
git commit -m "feat: build-time CMS fetch with resilient fallback

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 11: next-intl setup + IntlProvider

**Files:**
- Create: `components/providers/IntlProvider.tsx`, `components/hooks/useHasMounted.ts`, `i18n/request.ts` (only if the next-intl version requires it — see note)
- Modify: `next.config.ts` (wrap with `createNextIntlPlugin` only if using the plugin; we use the **provider-only** setup, so config may stay untouched)

**Interfaces:**
- Consumes: `Messages` type + both message trees (from `page.tsx`), `useUIStore` lang.
- Produces: `<IntlProvider messages={{pt,en}}>` client component that feeds `NextIntlClientProvider` the active-language tree and sets `<html lang>` reactively. `useHasMounted(): boolean`.
- Consumed by: `page.tsx` (wraps all sections).

> **Setup choice:** we do **not** use locale routing. Use next-intl's `NextIntlClientProvider` directly with `messages` + `locale` props — no `i18n/request.ts`, no middleware, no plugin. This is supported for client-side usage.

- [ ] **Step 1: Write `useHasMounted`**

```ts
// components/hooks/useHasMounted.ts
import { useEffect, useState } from 'react';

export function useHasMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
```

- [ ] **Step 2: Write `IntlProvider`**

```tsx
// components/providers/IntlProvider.tsx
'use client';

import { NextIntlClientProvider } from 'next-intl';
import { useEffect } from 'react';
import { useUIStore } from '@/store/ui-store';
import type { Messages } from '@/lib/cms/transform';

export function IntlProvider({
  messages,
  children,
}: {
  messages: { pt: Messages; en: Messages };
  children: React.ReactNode;
}) {
  const lang = useUIStore((s) => s.lang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <NextIntlClientProvider locale={lang} messages={messages[lang]}>
      {children}
    </NextIntlClientProvider>
  );
}
```

- [ ] **Step 3: Typecheck**

```bash
pnpm exec tsc --noEmit
```
Expected: no type errors. (No unit test for the provider; it's covered by the Playwright smoke.)

- [ ] **Step 4: Commit**

```bash
git add components/providers/IntlProvider.tsx components/hooks/useHasMounted.ts
git commit -m "feat: client IntlProvider driven by Zustand language

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 12: UI primitives (SectionHeading, Chip, TextLink, icons)

**Files:**
- Create: `components/ui/SectionHeading.tsx`, `components/ui/Chip.tsx`, `components/ui/TextLink.tsx`, `components/ui/icons/LinkedInIcon.tsx`, `components/ui/icons/GitHubIcon.tsx`

**Interfaces:**
- Produces:
  - `SectionHeading({ children, right? }: { children: ReactNode; right?: ReactNode })` — `<h2>` 15px/700, optional right-aligned meta.
  - `Chip({ children, variant }: { children: ReactNode; variant: 'ink' | 'faint' })` — bordered chip; `ink` = `border-ink` 13px pad `2px 10px`; `faint` = `border-faint text-body` 12px pad `1px 8px`.
  - `TextLink` — `<a>` with underline + `text-underline-offset:4px`, `text-ink`; passes through `href`, `target`, `children`, `className`.
  - `LinkedInIcon({ size }: { size?: number })`, `GitHubIcon({ size }: { size?: number })` — inline SVG, `fill: var(--ink)`.
- Consumed by: all sections/Header/Footer.

- [ ] **Step 1: Implement the primitives**

```tsx
// components/ui/SectionHeading.tsx
export function SectionHeading({
  children,
  right,
}: {
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-baseline justify-between gap-4">
      <h2 className="m-0 text-[15px] font-bold">{children}</h2>
      {right}
    </div>
  );
}
```

```tsx
// components/ui/Chip.tsx
export function Chip({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant: 'ink' | 'faint';
}) {
  const cls =
    variant === 'ink'
      ? 'border border-ink px-[10px] py-[2px] text-[13px]'
      : 'border border-faint text-body px-2 py-[1px] text-[12px]';
  return <span className={cls}>{children}</span>;
}
```

```tsx
// components/ui/TextLink.tsx
import type { AnchorHTMLAttributes } from 'react';

export function TextLink({
  className = '',
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      className={`text-ink underline [text-underline-offset:4px] ${className}`}
      {...props}
    />
  );
}
```

```tsx
// components/ui/icons/LinkedInIcon.tsx
export function LinkedInIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="var(--ink)" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
    </svg>
  );
}
```

```tsx
// components/ui/icons/GitHubIcon.tsx
export function GitHubIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="var(--ink)" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
pnpm exec tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/ui
git commit -m "feat: add UI primitives (heading, chip, link, social icons)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 13: Header (nav + language + theme toggles)

**Files:**
- Create: `components/layout/Header.tsx`

**Interfaces:**
- Consumes: `useUIStore` (lang, theme, setLang, toggleTheme), `useTranslations('nav')`, `TextLink`, `useHasMounted`.
- Produces: `<Header />`.

- [ ] **Step 1: Implement `components/layout/Header.tsx`**

```tsx
'use client';

import { useTranslations } from 'next-intl';
import { useUIStore } from '@/store/ui-store';
import { useHasMounted } from '@/components/hooks/useHasMounted';
import { TextLink } from '@/components/ui/TextLink';

export function Header() {
  const t = useTranslations('nav');
  const mounted = useHasMounted();
  const lang = useUIStore((s) => s.lang);
  const theme = useUIStore((s) => s.theme);
  const setLang = useUIStore((s) => s.setLang);
  const toggleTheme = useUIStore((s) => s.toggleTheme);

  const langStyle = (active: boolean) =>
    active
      ? 'text-ink font-bold underline [text-underline-offset:3px] cursor-pointer'
      : 'text-idle cursor-pointer';

  return (
    <div className="flex flex-wrap items-baseline justify-between gap-4 text-[14px]">
      <span className="font-bold">jonatha.botelho_</span>
      <div className="flex items-baseline gap-[22px]">
        <TextLink href="#ferramentas">{t('tools')}</TextLink>
        <TextLink href="#experiencia">{t('exp')}</TextLink>
        <TextLink href="#projetos">{t('projects')}</TextLink>
        <TextLink href="#contato">{t('contact')}</TextLink>
        <span className="text-dim">
          [ <span onClick={() => setLang('pt')} className={langStyle(lang === 'pt')}>PT</span> /{' '}
          <span onClick={() => setLang('en')} className={langStyle(lang === 'en')}>EN</span> ]
        </span>
        <span
          onClick={toggleTheme}
          role="button"
          tabIndex={0}
          aria-label={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
          className="cursor-pointer text-dim select-none hover:text-ink"
        >
          [{mounted ? (theme === 'dark' ? '☀' : '☾') : '☾'}]
        </span>
      </div>
    </div>
  );
}
```

> `mounted` guard avoids hydration mismatch on the theme glyph (server renders default `☾`).

- [ ] **Step 2: Typecheck**

```bash
pnpm exec tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/layout/Header.tsx
git commit -m "feat: header with nav, language and theme toggles

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 14: Hero (typewriter + sweep + chips + CTA + photo)

**Files:**
- Create: `components/hooks/useTypewriter.ts`, `components/hooks/useSweep.ts`, `components/sections/Hero.tsx`

**Interfaces:**
- Consumes: `useTranslations('hero')`, `SiteContent['hero']` (props: `techs`, `links`, `photoUrl`, `showPhoto`), `parseSummary`, `Chip`, `TextLink`, icons.
- Produces: `useTypewriter(full: string, speed?: number): string`; `useSweep(count: number): (el: HTMLElement | null, index: number) => void` (ref callback that runs the sweep with per-index delay); `<Hero techs links photoUrl showPhoto />`.

- [ ] **Step 1: Implement `useTypewriter`**

```ts
// components/hooks/useTypewriter.ts
import { useEffect, useState } from 'react';

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function useTypewriter(full: string, speed = 85): string {
  const [typed, setTyped] = useState(0);
  useEffect(() => {
    if (prefersReduced()) {
      setTyped(full.length);
      return;
    }
    const id = setInterval(() => {
      setTyped((n) => {
        if (n >= full.length) {
          clearInterval(id);
          return n;
        }
        return n + 1;
      });
    }, speed);
    return () => clearInterval(id);
  }, [full, speed]);
  return full.slice(0, typed);
}
```

- [ ] **Step 2: Implement `useSweep`**

```ts
// components/hooks/useSweep.ts
import { useCallback } from 'react';

const DELAYS = [400, 1000, 1600];
const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function useSweep() {
  return useCallback((el: HTMLElement | null, index: number) => {
    if (!el) return;
    if (prefersReduced()) {
      el.style.backgroundSize = '100% 100%';
      el.style.color = 'var(--bg)';
      return;
    }
    el.animate(
      [
        { backgroundSize: '0% 100%', color: 'var(--ink)', offset: 0 },
        { color: 'var(--ink)', offset: 0.45 },
        { color: 'var(--bg)', offset: 0.6 },
        { backgroundSize: '100% 100%', color: 'var(--bg)', offset: 1 },
      ],
      { duration: 600, delay: DELAYS[index] ?? 400, easing: 'ease-out', fill: 'forwards' },
    );
  }, []);
}
```

- [ ] **Step 3: Implement `components/sections/Hero.tsx`**

```tsx
'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';
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

  const segments = parseSummary(t('summary'));
  let hi = -1;

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
            hi += 1;
            const idx = hi;
            return (
              <span
                key={i}
                ref={(el) => sweep(el, idx)}
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
```

- [ ] **Step 4: Typecheck**

```bash
pnpm exec tsc --noEmit
```
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add components/sections/Hero.tsx components/hooks/useTypewriter.ts components/hooks/useSweep.ts
git commit -m "feat: hero section with typewriter, sweep highlights, CTA and photo

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 15: Now + Tools sections

**Files:**
- Create: `components/sections/Now.tsx`, `components/sections/Tools.tsx`

**Interfaces:**
- Consumes: `useTranslations`, `SectionHeading`.
- Produces: `<Now />`, `<Tools />`.

- [ ] **Step 1: Implement `components/sections/Now.tsx`**

```tsx
'use client';

import { useTranslations } from 'next-intl';
import { SectionHeading } from '@/components/ui/SectionHeading';

export function Now() {
  const t = useTranslations();
  const items = t.raw('now.items') as string[];
  return (
    <div id="agora" className="border-b border-dashed border-faint py-10">
      <SectionHeading
        right={<span className="text-[12px] text-faint">{t('meta.nowUpdated')}</span>}
      >
        00 — {t('section.now')}
      </SectionHeading>
      <div className="flex flex-col gap-[10px] text-[15px] leading-[1.65] text-body">
        {items.map((item, i) => (
          <div key={i} className="flex gap-3">
            <span className="font-bold text-ink">▸</span>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

> **Section titles:** the heading label (`AGORA_/NOW_`, etc.) is language-dependent. Add a `section` namespace to the messages tree (`now/tools/exp/projects/education/contact`), sourced from the prototype `s0..s5` **without** the numeric prefix (e.g. PT `s0='00 — AGORA_'` → `section.now='AGORA_'`). Update `transform.ts` messages `+ section: { now, tools, exp, projects, education, contact }` and the fallback content accordingly. Because this crosses Tasks 6/9, add these keys there: extend `portfolioSchema` with `sections: { now, tools, exp, projects, education, contact }` (each `Loc`) and map into `messages.section`.

- [ ] **Step 2: Implement `components/sections/Tools.tsx`**

```tsx
'use client';

import { useTranslations } from 'next-intl';
import { SectionHeading } from '@/components/ui/SectionHeading';

export function Tools() {
  const t = useTranslations();
  const names = t.raw('tools.names') as string[];
  const items = t.raw('tools.items') as string[];
  return (
    <div id="ferramentas" className="border-b border-dashed border-faint py-10">
      <SectionHeading>01 — {t('section.tools')}</SectionHeading>
      <div className="flex flex-col gap-[14px] text-[15px]">
        {names.map((name, i) => (
          <div
            key={i}
            className="grid grid-cols-[190px_1fr] items-baseline gap-4 max-[520px]:grid-cols-1"
          >
            <span className="font-bold">→ {name}</span>
            <span className="leading-[1.6] text-body">{items[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Reconcile section-title keys**

Apply the note from Step 1: add `sections` to `portfolioSchema` (Task 5), to `content/fallback.json` (Task 6) with values from prototype `s0..s5` minus the `NN — ` prefix, and to `transform.ts` (Task 9) as `messages.section`. Re-run:

```bash
pnpm test -- cms
```
Expected: all CMS tests still PASS with the added keys.

- [ ] **Step 4: Typecheck + commit**

```bash
pnpm exec tsc --noEmit
git add components/sections/Now.tsx components/sections/Tools.tsx lib/cms/schema.ts lib/cms/transform.ts content/fallback.json __tests__/cms
git commit -m "feat: now and tools sections + section-title i18n keys

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 16: Experience section

**Files:**
- Create: `components/sections/Experience.tsx`

**Interfaces:**
- Consumes: `useTranslations`, `useUIStore` (lang for duration/month), `SiteContent['experience']`, `calcDuration`, `formatMonthYear`, `Chip`, `SectionHeading`.
- Produces: `<Experience experience={SiteContent['experience']} />`.

- [ ] **Step 1: Implement `components/sections/Experience.tsx`**

```tsx
'use client';

import { useTranslations } from 'next-intl';
import { useUIStore } from '@/store/ui-store';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Chip } from '@/components/ui/Chip';
import { calcDuration } from '@/lib/duration';
import { formatMonthYear } from '@/lib/month';
import type { SiteContent } from '@/lib/cms/transform';

export function Experience({ experience }: { experience: SiteContent['experience'] }) {
  const t = useTranslations();
  const lang = useUIStore((s) => s.lang);
  const roles = t.raw('experience.roles') as string[];
  const bullets = t.raw('experience.bullets') as { head: string; text: string }[][];
  const present = lang === 'pt' ? 'presente' : 'present';

  return (
    <div id="experiencia" className="border-b border-dashed border-faint py-10">
      <SectionHeading>02 — {t('section.exp')}</SectionHeading>
      <div className="flex flex-col gap-10">
        {experience.map((job, i) => {
          const start = formatMonthYear(job.start, lang);
          const end = job.end ? formatMonthYear(job.end, lang) : present;
          const dur = calcDuration(job.start, job.end, lang);
          return (
            <div key={i} className="grid grid-cols-[14px_1fr] gap-5">
              <div className="flex flex-col items-center gap-[6px] pt-[6px]">
                <span className="h-[9px] w-[9px] flex-none bg-ink" />
                <span className="w-px flex-1 bg-hair" />
              </div>
              <div className="flex flex-col gap-[10px]">
                <div className="flex flex-wrap items-baseline justify-between gap-4">
                  <span className="text-[17px] font-bold underline [text-decoration-thickness:2px] [text-underline-offset:5px]">
                    {roles[i]} | {job.company}
                  </span>
                  <span className="text-[13px] whitespace-nowrap text-faint">
                    {start} — {end} · {dur}
                  </span>
                </div>
                <div className="flex flex-col gap-2 text-[15px] leading-[1.65] text-body">
                  {bullets[i].map((b, j) => (
                    <div key={j} className="flex gap-3">
                      <span className="text-faint">·</span>
                      <span>
                        <span className="font-bold text-ink">{b.head}</span> {b.text}
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
```

- [ ] **Step 2: Typecheck + commit**

```bash
pnpm exec tsc --noEmit
git add components/sections/Experience.tsx
git commit -m "feat: experience timeline with computed durations

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 17: Projects + Education sections

**Files:**
- Create: `components/sections/Projects.tsx`, `components/sections/Education.tsx`

**Interfaces:**
- Consumes: `useTranslations`, `SiteContent['projects']`, `flags.showEducation`, `SectionHeading`, `TextLink`.
- Produces: `<Projects projects={SiteContent['projects']} />`, `<Education show={boolean} />`.

- [ ] **Step 1: Implement `components/sections/Projects.tsx`**

```tsx
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
                <div className="flex h-full w-full items-center justify-center bg-hair text-[12px] text-dim">
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
```

> Add `projects.view` to messages (PT `ver projeto` / EN `view project`) from prototype `viewProject`. Include it in `portfolioSchema` (as `projectsView: Loc`), `fallback.json`, and `transform.ts` (`messages.projects.view`).

- [ ] **Step 2: Implement `components/sections/Education.tsx`**

```tsx
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
```

- [ ] **Step 3: Reconcile `projects.view` key + test**

```bash
pnpm test -- cms
pnpm exec tsc --noEmit
```
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add components/sections/Projects.tsx components/sections/Education.tsx lib/cms/schema.ts lib/cms/transform.ts content/fallback.json
git commit -m "feat: projects and education sections

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 18: Contact form schema + validation tests

**Files:**
- Create: `lib/contact-schema.ts`
- Test: `__tests__/lib/contact-schema.test.ts`

**Interfaces:**
- Produces: `contactSchema` (Zod), `type ContactInput = z.infer<typeof contactSchema>`. Fields `name` (min 1), `email` (email), `message` (min 1), `website` (honeypot, must be empty), `lang` (`'pt'|'en'`).
- Consumed by: `Contact.tsx`, `api/contact/route.ts`.

- [ ] **Step 1: Write the failing test**

```ts
// __tests__/lib/contact-schema.test.ts
import { describe, it, expect } from 'vitest';
import { contactSchema } from '@/lib/contact-schema';

const base = { name: 'Ana', email: 'ana@example.com', message: 'oi', website: '', lang: 'pt' };

describe('contactSchema', () => {
  it('accepts a valid submission', () => {
    expect(contactSchema.safeParse(base).success).toBe(true);
  });
  it('rejects empty name', () => {
    expect(contactSchema.safeParse({ ...base, name: '' }).success).toBe(false);
  });
  it('rejects malformed email', () => {
    expect(contactSchema.safeParse({ ...base, email: 'nope' }).success).toBe(false);
  });
  it('rejects empty message', () => {
    expect(contactSchema.safeParse({ ...base, message: '' }).success).toBe(false);
  });
  it('rejects a filled honeypot', () => {
    expect(contactSchema.safeParse({ ...base, website: 'bot' }).success).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- contact-schema`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `lib/contact-schema.ts`**

```ts
import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(1),
  website: z.string().max(0).optional().default(''),
  lang: z.enum(['pt', 'en']),
});

export type ContactInput = z.infer<typeof contactSchema>;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- contact-schema`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/contact-schema.ts __tests__/lib/contact-schema.test.ts
git commit -m "feat: add contact form validation schema

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 19: Contact API route (Resend)

**Files:**
- Create: `app/api/contact/route.ts`
- Test: `__tests__/api/contact.test.ts`

**Interfaces:**
- Consumes: `contactSchema`, `resend`.
- Produces: `POST` handler → `{ ok: true }` (200) on success; `{ ok: false, error }` (400 invalid, 500 send failure). Honeypot filled → 200 `{ ok: true }` without sending.

- [ ] **Step 1: Write the failing test**

```ts
// __tests__/api/contact.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const sendMock = vi.fn();
vi.mock('resend', () => ({
  Resend: vi.fn(() => ({ emails: { send: sendMock } })),
}));

async function callRoute(body: unknown) {
  const { POST } = await import('@/app/api/contact/route');
  return POST(new Request('http://x/api/contact', { method: 'POST', body: JSON.stringify(body) }));
}

const valid = { name: 'Ana', email: 'ana@x.com', message: 'oi', website: '', lang: 'pt' };

describe('POST /api/contact', () => {
  beforeEach(() => {
    sendMock.mockReset();
    vi.stubEnv('RESEND_API_KEY', 'test');
    vi.stubEnv('CONTACT_TO_EMAIL', 'to@x.com');
  });

  it('sends and returns ok on valid input', async () => {
    sendMock.mockResolvedValue({ data: { id: '1' }, error: null });
    const res = await callRoute(valid);
    expect(res.status).toBe(200);
    expect(sendMock).toHaveBeenCalledOnce();
  });

  it('returns 400 on invalid input without sending', async () => {
    const res = await callRoute({ ...valid, email: 'nope' });
    expect(res.status).toBe(400);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('silently accepts a filled honeypot without sending', async () => {
    const res = await callRoute({ ...valid, website: 'bot' });
    expect(res.status).toBe(200);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('returns 500 when the provider fails', async () => {
    sendMock.mockResolvedValue({ data: null, error: { message: 'boom' } });
    const res = await callRoute(valid);
    expect(res.status).toBe(500);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- api/contact`
Expected: FAIL — route module not found.

- [ ] **Step 3: Implement `app/api/contact/route.ts`**

```ts
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { contactSchema } from '@/lib/contact-schema';

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(json);
  if (!parsed.success) {
    // honeypot failure is indistinguishable from other validation errors on the client,
    // but we special-case a filled honeypot as a silent success:
    const honeypot =
      typeof (json as Record<string, unknown>)?.website === 'string' &&
      ((json as Record<string, unknown>).website as string).length > 0;
    if (honeypot) return NextResponse.json({ ok: true });
    return NextResponse.json({ ok: false, error: 'invalid_input' }, { status: 400 });
  }

  const { name, email, message, lang } = parsed.data;
  const to = process.env.CONTACT_TO_EMAIL ?? 'jonathabotelho1@gmail.com';
  const subject =
    lang === 'pt' ? `Contato via portfólio — ${name}` : `Portfolio contact — ${name}`;
  const body = `${message}\n\n— ${name}${email ? ` (${email})` : ''}`;

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: 'Portfolio <onboarding@resend.dev>',
      to,
      replyTo: email,
      subject,
      text: body,
    });
    if (error) return NextResponse.json({ ok: false, error: 'send_failed' }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'send_failed' }, { status: 500 });
  }
}
```

> `from` uses Resend's shared `onboarding@resend.dev` until Jonatha verifies a domain; documented in README/`.env.example`.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- api/contact`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add app/api/contact/route.ts __tests__/api/contact.test.ts
git commit -m "feat: contact API route with Resend and honeypot handling

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 20: Contact section (form UI) + Footer

**Files:**
- Create: `components/sections/Contact.tsx`, `components/layout/Footer.tsx`

**Interfaces:**
- Consumes: `useTranslations`, `useUIStore` (lang), `react-hook-form`, `zodResolver`, `contactSchema`, `SiteContent['hero']['links']`, icons, `TextLink`.
- Produces: `<Contact links={links} />`, `<Footer />`.

- [ ] **Step 1: Implement `components/sections/Contact.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useUIStore } from '@/store/ui-store';
import { contactSchema, type ContactInput } from '@/lib/contact-schema';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { TextLink } from '@/components/ui/TextLink';
import { LinkedInIcon } from '@/components/ui/icons/LinkedInIcon';
import { GitHubIcon } from '@/components/ui/icons/GitHubIcon';
import type { SiteContent } from '@/lib/cms/transform';

type Status = 'idle' | 'sending' | 'success' | 'error';
const inputCls =
  'w-full box-border border border-ink bg-bg px-[14px] py-3 text-[15px] text-ink outline-none';

export function Contact({ links }: { links: SiteContent['hero']['links'] }) {
  const t = useTranslations();
  const lang = useUIStore((s) => s.lang);
  const [status, setStatus] = useState<Status>('idle');
  const { register, handleSubmit, reset } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', message: '', website: '', lang },
  });

  const onSubmit = async (data: ContactInput) => {
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, lang }),
      });
      if (!res.ok) throw new Error();
      setStatus('success');
      reset({ name: '', email: '', message: '', website: '', lang });
    } catch {
      setStatus('error');
    }
  };

  return (
    <div id="contato" className="pt-11 pb-14">
      <SectionHeading>05 — {t('section.contact')}</SectionHeading>
      <p className="m-0 mb-7 text-[22px] font-bold">{t('form.cta')}</p>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex max-w-[480px] flex-col gap-3"
        noValidate
      >
        <input className={inputCls} placeholder={t('form.name')} {...register('name')} />
        <input className={inputCls} placeholder={t('form.email')} {...register('email')} />
        <textarea
          className={`${inputCls} resize-none`}
          rows={5}
          placeholder={t('form.message')}
          {...register('message')}
        />
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
          {...register('website')}
        />
        <button
          type="submit"
          disabled={status === 'sending'}
          className="self-start bg-ink px-6 py-3 text-[14px] font-bold text-bg disabled:opacity-60"
        >
          {t('form.send')} →
        </button>
        {status === 'success' && (
          <span className="text-[13px] text-dim">{t('form.success')}</span>
        )}
        {status === 'error' && (
          <span className="text-[13px] text-faint">{t('form.error')}</span>
        )}
      </form>
      <div className="mt-8 flex flex-wrap gap-7 text-[14px]">
        <TextLink href={`mailto:${links.email}`}>{links.email}</TextLink>
        <TextLink
          href={links.linkedin}
          target="_blank"
          className="inline-flex items-center gap-[6px]"
        >
          <LinkedInIcon size={15} />
          /linkedin
        </TextLink>
        <TextLink
          href={links.github}
          target="_blank"
          className="inline-flex items-center gap-[6px]"
        >
          <GitHubIcon size={15} />
          /github
        </TextLink>
      </div>
    </div>
  );
}
```

> Add `form.success` / `form.error` messages (PT: "Mensagem enviada, obrigado!" / "Não foi possível enviar. Escreva para o e-mail abaixo." — EN: "Message sent, thanks!" / "Couldn't send. Please use the email below.") to `portfolioSchema.form`, `fallback.json`, and `transform.ts`.

- [ ] **Step 2: Implement `components/layout/Footer.tsx`**

```tsx
'use client';

import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations();
  return (
    <div className="flex flex-wrap justify-between gap-4 border-t-[3px] border-double border-ink pt-5 pb-7 text-[12px] text-dim">
      <span>{t('meta.footer')}</span>
      <span>made by ♥ jonatha.botelho_</span>
    </div>
  );
}
```

- [ ] **Step 3: Reconcile form.success/error keys + test**

```bash
pnpm test -- cms
pnpm exec tsc --noEmit
```
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add components/sections/Contact.tsx components/layout/Footer.tsx lib/cms/schema.ts lib/cms/transform.ts content/fallback.json
git commit -m "feat: contact form UI and footer

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 21: Page composition (wire everything)

**Files:**
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `getContent`, `transform`, `IntlProvider`, all sections + Header/Footer.
- Produces: the full statically-generated page.

- [ ] **Step 1: Implement `app/page.tsx`**

```tsx
import { getContent } from '@/lib/cms/fetch';
import { transform } from '@/lib/cms/transform';
import { IntlProvider } from '@/components/providers/IntlProvider';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/sections/Hero';
import { Now } from '@/components/sections/Now';
import { Tools } from '@/components/sections/Tools';
import { Experience } from '@/components/sections/Experience';
import { Projects } from '@/components/sections/Projects';
import { Education } from '@/components/sections/Education';
import { Contact } from '@/components/sections/Contact';

export default async function Page() {
  const content = await getContent();
  const { messages, content: site } = transform(content);

  return (
    <IntlProvider messages={messages}>
      <div className="flex min-h-screen justify-center">
        <div className="box-border w-full max-w-[820px] px-8 pt-10">
          <Header />
          <Hero
            techs={site.hero.techs}
            links={site.hero.links}
            photoUrl={site.hero.photoUrl}
            showPhoto={site.flags.showPhoto}
          />
          <Now />
          <Tools />
          <Experience experience={site.experience} />
          <Projects projects={site.projects} />
          <Education show={site.flags.showEducation} />
          <Contact links={site.hero.links} />
          <Footer />
        </div>
      </div>
    </IntlProvider>
  );
}
```

- [ ] **Step 2: Build and run**

```bash
pnpm build && pnpm start -p 3100 &
sleep 5 && curl -s http://localhost:3100 | grep -qi "JONATHA\|jonatha.botelho_" && echo "PAGE RENDERS" ; kill %1
```
Expected: build succeeds; served HTML contains the name/handle.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: compose full portfolio page

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 22: Apps Script `doGet` reference

**Files:**
- Create: `apps-script/Code.gs`, `apps-script/README.md`

**Interfaces:**
- Produces: reference `doGet` that reads the Sheet tabs and returns the JSON contract; not part of the site build.

- [ ] **Step 1: Write `apps-script/Code.gs`**

```js
/**
 * Reference Apps Script Web App for the Jonatha Botelho v2 portfolio CMS.
 * Deploy: Extensions → Apps Script → Deploy → New deployment → Web app
 *   Execute as: Me · Who has access: Anyone.
 * Copy the /exec URL into the site env var CMS_ENDPOINT_URL.
 * Set CMS_TOKEN in both the site env and TOKEN below to require ?token=.
 *
 * Expected Sheet tabs (see apps-script/README.md for column layouts):
 *   meta, flags, nav, hero, heroTechs, now, tools, experience, expBullets,
 *   projects, projectStack, education, form, sections
 * This function assembles the exact JSON contract the site validates with Zod.
 * Simplest supported approach: keep a single tab named "payload" with one cell
 * (A1) holding the full JSON, edited via AppSheet, and return it verbatim.
 */
var TOKEN = ''; // set to match site CMS_TOKEN, or leave '' to allow all

function doGet(e) {
  if (TOKEN && (!e || !e.parameter || e.parameter.token !== TOKEN)) {
    return json_({ error: 'unauthorized' });
  }
  var payload = buildPayload_();
  return json_(payload);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

/**
 * Minimal reference: reads the whole contract from a single "payload" tab, cell A1.
 * Replace with per-tab assembly once the AppSheet schema is built.
 */
function buildPayload_() {
  var sheet = SpreadsheetApp.getActive().getSheetByName('payload');
  var raw = sheet.getRange('A1').getValue();
  return JSON.parse(raw);
}
```

- [ ] **Step 2: Write `apps-script/README.md`**

Document: the two authoring options (single-cell JSON vs per-tab), the exact contract (link to the spec section), how to deploy the Web App, how to set `TOKEN`, and how to wire the AppSheet "atualizar infos do site" Automation to POST the Vercel Deploy Hook URL.

- [ ] **Step 3: Commit**

```bash
git add apps-script
git commit -m "docs: add Apps Script doGet reference and CMS wiring guide

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 23: Playwright smoke test

**Files:**
- Create: `e2e/smoke.spec.ts`

**Interfaces:**
- Consumes: the running app (Playwright `webServer`).
- Produces: one smoke test covering typing, theme toggle, language toggle, nav anchor.

- [ ] **Step 1: Write `e2e/smoke.spec.ts`**

```ts
import { test, expect } from '@playwright/test';

test('portfolio smoke: typing, theme, language, nav', async ({ page }) => {
  await page.goto('/');

  // name types in
  await expect(page.getByRole('heading', { level: 1 })).toContainText('JONATHA BOTELHO', {
    timeout: 5000,
  });

  // theme toggle flips <html data-theme>
  const html = page.locator('html');
  await expect(html).toHaveAttribute('data-theme', 'light');
  await page.getByRole('button', { name: /modo/i }).click();
  await expect(html).toHaveAttribute('data-theme', 'dark');

  // language toggle switches a visible string (nav: ferramentas → toolkit)
  await expect(page.getByRole('link', { name: 'ferramentas' })).toBeVisible();
  await page.getByText('EN', { exact: true }).click();
  await expect(page.getByRole('link', { name: 'toolkit' })).toBeVisible();

  // nav anchor works
  await page.getByRole('link', { name: 'projects' }).click();
  await expect(page).toHaveURL(/#projetos/);
});
```

- [ ] **Step 2: Run the smoke test**

Run: `pnpm test:e2e`
Expected: PASS (builds, starts on 3100, 1 test green). Fix selectors if the DOM differs.

- [ ] **Step 3: Commit**

```bash
git add e2e/smoke.spec.ts playwright.config.ts
git commit -m "test: add Playwright smoke test

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 24: README, env docs, final verification

**Files:**
- Create/Modify: `README.md`

**Interfaces:** none (docs + final gate).

- [ ] **Step 1: Write `README.md`**

Cover: project summary; stack; `pnpm install`, `pnpm dev`, `pnpm build`, `pnpm test`, `pnpm test:e2e`; env vars (`.env.example`); the CMS pipeline (Sheets → AppSheet → Apps Script `doGet` → build-time fetch; `fallback.json` behavior); **"Publicando alterações de conteúdo"** (AppSheet button → Vercel Deploy Hook → rebuild); how to set up Resend + verify a domain; where project screenshots go (`public/images/`, 280×200) and how to set `projects[].imageUrl` in the CMS.

- [ ] **Step 2: Full verification gate**

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm test
pnpm test:e2e
pnpm build
```
Expected: all green. Record actual output. Do not claim completion unless every command passes.

- [ ] **Step 3: Manual visual pass (dev server)**

```bash
pnpm dev
```
Open `http://localhost:3000`. Verify against the prototype (`design_handoff_portfolio_v2/design/Jonatha Botelho - Portfolio v2.dc.html`): name types out; three summary highlights sweep in order; PT/EN toggle swaps all copy; theme toggle has no flash on reload; hero photo has grayscale + hard shadow; timeline durations read correctly; section dividers dashed; hero/footer double borders. Fix discrepancies before finishing.

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: add project README with CMS and deploy instructions

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Self-Review (author checklist — completed)

**Spec coverage:** tokens (T2), typography/scale (per-component arbitrary values), all 9 sections (T13–T21), typing+sweep+reduced-motion (T14), theme+lang persistence+anti-flash (T3/T4), i18n PT/EN (T6/T9/T11), duration/month (T8), CMS contract+fetch+fallback+transform+summary (T5–T10), Apps Script doGet + Deploy Hook wiring (T22/T24), contact form + Resend + honeypot + mailto fallback (T18–T20), tests (unit across tasks + Playwright T23), metadata/a11y (T4/T13). All spec sections map to a task.

**Cross-task key additions:** section titles, `projects.view`, and `form.success/error` are introduced in later tasks but must be threaded back into `portfolioSchema` (T5), `fallback.json` (T6), and `transform.ts` (T9). Each such task explicitly restates this and re-runs `pnpm test -- cms`. Implementers must honor those reconciliation steps.

**Type consistency:** `getContent → PortfolioContent`; `transform → { messages:{pt,en}, content:SiteContent }`; `Messages`/`SiteContent` shapes consumed by sections match their producers. `calcDuration(start, end, lang, now?)` and `formatMonthYear(iso, lang)` signatures are stable across T8/T16.
