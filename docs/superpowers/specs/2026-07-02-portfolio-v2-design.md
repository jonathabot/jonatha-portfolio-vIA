# Design: Portfólio Jonatha Botelho v2 (Next.js + Tailwind)

**Data:** 2026-07-02
**Fonte do design:** `design_handoff_portfolio_v2/README.md` + protótipo `design/Jonatha Botelho - Portfolio v2.dc.html`
**Fidelidade:** High-fidelity (hifi) — cores, tipografia, espaçamentos, copy e interações são finais.

## Objetivo

Recriar o design "terminal/typewriter" do handoff v2 como um projeto Next.js novo, limpo e de produção — página única, bilíngue (PT/EN), dark mode, animação de digitação no nome e sweep nos destaques do resumo. Todo o conteúdo é estático (sem CMS Hygraph, ao contrário do v1).

## Decisões tomadas no brainstorming

| Tema | Decisão |
|---|---|
| Framework | Next.js 15 (App Router) + React 19 + TypeScript strict |
| Estilo | Tailwind CSS v4 (tokens via `@theme` / CSS custom properties) |
| Fonte | Courier Prime via `next/font/google` (self-hosted; desvio justificado do `<link>` do protótipo) |
| i18n | **next-intl** sem roteamento por locale; locale controlado client-side |
| Estado global | **Zustand** (com `persist` middleware) para `theme` + `lang` |
| Formulário | React Hook Form + **Zod** (schema compartilhado client+server) |
| E-mail | **Resend** via API route `app/api/contact/route.ts` |
| Testes | Nível médio: Vitest (unit) + 1 Playwright smoke E2E + ESLint/Prettier/TS strict |
| Imagens de projeto | Placeholder cinza 280×200 com label (imagens reais fornecidas depois) |
| Package manager | pnpm |
| Git | `git init` + `.gitignore` + commit inicial (local, sem remoto) |
| Reduced motion | Suportar `prefers-reduced-motion` (acréscimo de a11y aprovado) |

## Arquitetura de estado

- **Zustand `useUIStore`** (`store/ui-store.ts`) com `persist` middleware:
  - `theme: 'light' | 'dark'` → localStorage `jb-portfolio-theme` (default `light`)
  - `lang: 'pt' | 'en'` → localStorage `jb-portfolio-lang` (default `pt`)
  - ações: `toggleTheme()`, `setTheme()`, `setLang()`
- **Script inline anti-flash** no `<head>` (`layout.tsx`): lê `jb-portfolio-theme` do localStorage e seta `data-theme` no `<html>` **antes do paint**, evitando FOUC. O Zustand sincroniza após a hidratação (mesma chave, sem divergência). Exigido explicitamente pelo README (State Management).
- **`typed: number`** (progresso da digitação): `useState` local no `Hero` — estado efêmero, não global (YAGNI).
- **Formulário**: estado gerido por React Hook Form localmente no `Contact`.
- Sem data fetching; todo conteúdo estático.

## Estrutura de pastas

```
jonatha-portfolio-v2/
├─ app/
│  ├─ layout.tsx              # <html>, Courier Prime, script anti-flash inline, metadata/OG
│  ├─ page.tsx                # monta seções em ordem; providers
│  ├─ globals.css             # @theme Tailwind v4, tokens, [data-theme="dark"]
│  └─ api/contact/route.ts    # POST → valida (Zod) → envia (Resend)
├─ components/
│  ├─ providers/IntlProvider.tsx   # lê lang do store → NextIntlClientProvider
│  ├─ layout/Header.tsx            # nav + LangToggle + ThemeToggle
│  ├─ layout/Footer.tsx
│  ├─ sections/Hero.tsx            # typing + sweep, chips, CTA, foto
│  ├─ sections/Now.tsx             # 00 — AGORA
│  ├─ sections/Tools.tsx           # 01 — FERRAMENTAS
│  ├─ sections/Experience.tsx      # 02 — EXPERIÊNCIA (calcDuration)
│  ├─ sections/Projects.tsx        # 03 — PROJETOS
│  ├─ sections/Education.tsx       # 04 — FORMAÇÃO
│  ├─ sections/Contact.tsx         # 05 — CONTATO (RHF + Zod)
│  └─ ui/
│     ├─ SectionHeading.tsx        # "NN — NOME_" + slot à direita
│     ├─ Chip.tsx                  # variantes ink-border / faint-border
│     ├─ TextLink.tsx              # underline + offset padrão
│     └─ icons/                    # LinkedIn, GitHub SVG
├─ store/ui-store.ts               # Zustand: theme, lang (+ persist)
├─ lib/
│  ├─ duration.ts                  # calcDuration(start, end, lang) — puro, testável
│  └─ contact-schema.ts            # Zod schema compartilhado client+server
├─ messages/pt.json / en.json      # dicionários i18n (verbatim do protótipo)
├─ content/portfolio.ts            # dados não-traduzíveis (URLs, techs hero, datas, ordem projetos)
├─ public/favicon.svg
├─ public/images/profile-pic.png
├─ __tests__/                      # Vitest
└─ e2e/                            # Playwright smoke
```

### Separação `messages/` vs `content/`

- **`messages/*.json`**: copy traduzível (nav, hero, itens de "agora", categorias de ferramentas, bullets de experiência, descrições de projeto, formação, labels de formulário, footer) — **verbatim** do dicionário `strings()` do protótipo.
- **`content/portfolio.ts`**: dados que não são texto traduzível — URLs (LinkedIn `linkedin.com/in/jonathabotelho`, GitHub `github.com/jonathabot`, repos), lista de techs do hero, techs por experiência, datas cruas de início/fim, ordem dos projetos, e-mail de contato. Fonte única, sem duplicação entre PT/EN.
- **Período da experiência**: datas cruas em `content/` + labels de mês/"presente" no i18n + `calcDuration()` monta o texto final por idioma. A duração recalcula em runtime (ex: "1 ano e 11 meses" / "1 yr 11 mos"), sem hardcode — conforme README.

## Design tokens (globals.css)

```css
:root { --bg:#ffffff; --ink:#111111; --body:#444444; --dim:#666666;
        --faint:#999999; --idle:#bbbbbb; --hair:#cccccc; }
:root[data-theme="dark"] { --bg:#0d0d0d; --ink:#ececec; --body:#b0b0b0;
        --dim:#8f8f8f; --faint:#6f6f6f; --idle:#555555; --hair:#3a3a3a; }
body { background: var(--bg); transition: background .25s; }
```

- Tokens expostos via `@theme inline` → utilities `bg-bg`, `text-ink`, `text-body`, `text-dim`, `text-faint`, `border-ink`, `border-faint`, `bg-hair` etc.
- **Raio zero global** (sem `rounded-*`).
- Só o `background` do body tem transition; textos trocam instantâneo.

### Valores fixos (respeitados à risca)

- Bordas: `3px double var(--ink)` (fim hero / topo footer); divisores `1px dashed var(--faint)`.
- Foto hero: 240×240, `border:1px solid var(--ink)`, `box-shadow:10px 10px 0 var(--ink)`, `filter:grayscale(1) contrast(1.05)`.
- Imagens de projeto: 280×200, `border:1px solid var(--ink)`, `filter:grayscale(1)`.
- Chips hero: `border:1px solid var(--ink)`, pad `2px 10px`, 13px. Chips tech por exp: `border:1px solid var(--faint)`, `color:var(--body)`, pad `1px 8px`, 12px.
- Links: `underline`, `text-underline-offset:4px`, `color:var(--ink)`.
- Container: `max-width:820px`, pad lateral 32px, topo 40px.
- Escala tipográfica: h1 38px/700; CTA contato 22px/700; títulos item 17px/700 sublinhado (thickness 2px, offset 5px); corpo 15–16px lh 1.65–1.7; nav/links 14px; metadados/datas 13px; footer/"última atualização" 12px.
- Paddings de seção: 40px vertical (contato 44px/56px); hero `64px 0 52px` gap 48px; projetos gap 44px; experiências gap 40px.
- Arbitrary values do Tailwind onde não houver utility na escala (`text-[38px]`, `shadow-[10px_10px_0_var(--ink)]`).

## Animações (Web Animations API)

Usar WAAPI (`element.animate`), não CSS keyframes, porque os valores animados usam `var(--ink)`/`var(--bg)` que mudam com o tema. Todas respeitam `prefers-reduced-motion` (mostram estado final sem animar).

1. **Digitação do nome** — "JONATHA BOTELHO" char a char, 85ms/letra ao montar (`useState` + `setInterval`, cleanup no unmount). Cursor `_` pisca via `element.animate` step 1↔0 a cada 500ms, `duration:1000`, `iterations:Infinity`.
2. **Sweep dos 3 destaques** (Google Workspace, Apps Script, React) — cada span com `background-image:linear-gradient(var(--ink),var(--ink))`, `background-repeat:no-repeat`; anima `background-size` `0% 100%→100% 100%`, cor do texto → `var(--bg)` a ~60%. `duration:600`, `ease-out`, delays 400/1000/1600ms, `fill:'forwards'`. Roda uma vez ao montar.
3. Encapsuladas em hooks (`useTypewriter`, `useSweep`) ou no `Hero`; ambas curto-circuitam se `prefers-reduced-motion: reduce`.

## Seções (ordem do README)

1. **Header/nav** — flex space-between baseline. Esquerda `jonatha.botelho_` (14px/700). Direita (gap 22px): âncoras `ferramentas/experiência/projetos/contato` (sublinhadas), `[ PT / EN ]`, `[☾]`/`[☀]`. Idioma ativo `var(--ink)`/700/sublinhado; inativo `var(--idle)`. Toggle tema hover `var(--ink)`.
2. **Hero** — 2 colunas (texto flex:1 min-width 380px; foto 240×240 à direita, some via wrap em telas estreitas). "olá, meu nome é" → nome digitado + cursor → cargo → resumo com 3 sweeps → chips → CTA (bloco ink/bg) + `/linkedin` `/github` com SVG 16px.
3. **00 — AGORA_** — heading + "última atualização: jul 2026" à direita. 3 itens com marcador `▸` ink/700.
4. **01 — FERRAMENTAS_** — grid `190px 1fr`: `→ Categoria` (700) | techs separadas por ` · ` (`--body`). 5 categorias.
5. **02 — EXPERIÊNCIA_** — timeline (col 14px: quadrado 9×9 `var(--ink)` + linha 1px `var(--hair)`); cargo|empresa (17px/700 sublinhado) + período à direita (13px `--faint`, com duração dinâmica); bullets `·` com lead 700; chips de techs. 2 experiências.
6. **03 — PROJETOS_** — 3 projetos, grid `280px 1fr` gap 28px: imagem 280×200 grayscale (placeholder) | título sublinhado + data à direita + descrição + stack `Chave: valor` (13px) + "ver projeto →" quando há repo. Ordem: Programatical (TCC 2025) → Stinx (2025—presente) → jonatha-portfolio v1 (2023).
7. **04 — FORMAÇÃO_** — duas linhas space-between: graduação/instituição + ano; idiomas + certificação. (Toggleável via `showEducation`, default true.)
8. **05 — CONTATO_** — CTA 22px/700 + formulário (max-width 480px): inputs/textarea `border:1px solid var(--ink)`, `bg:var(--bg)`, pad `12px 14px`, monospace, sem raio, sem resize; botão "ENVIAR MENSAGEM →" estilo CTA. Abaixo: e-mail + linkedin + github (gap 28px).
9. **Footer** — borda dupla topo; © à esquerda, `made by ♥ jonatha.botelho_` à direita (12px `--dim`).

## Formulário de contato & API

### Schema (lib/contact-schema.ts)

```ts
contactSchema = z.object({
  name:    z.string().min(1),
  email:   z.string().email(),
  message: z.string().min(1),
  // honeypot anti-bot (campo oculto; deve vir vazio)
  website: z.string().max(0).optional(),
})
```

### Client (Contact.tsx)

- React Hook Form + `zodResolver`.
- Estados do botão: `idle → sending → success | error`, mensagens i18n (PT/EN).
- Erros de validação abaixo dos campos, `var(--faint)`/13px.
- Inputs mantêm estilo do handoff (border ink, sem resize, monospace, sem raio).
- Honeypot: campo oculto `website` (bots preenchem, humanos não).

### Server (app/api/contact/route.ts)

- Revalida com o **mesmo** `contactSchema` (nunca confia no client) → 400 se inválido.
- Honeypot preenchido → responde 200 fake-success sem enviar (não sinaliza ao bot).
- Envia via Resend (`RESEND_API_KEY` em `.env.local`, documentado em `.env.example`). Destino `jonathabotelho1@gmail.com`; subject/body por idioma (`lang` no payload); `reply-to` = e-mail do visitante.
- Retorna `{ ok: true }` / `{ ok: false, error }`.
- Falha de envio → 500 tratado; UI mostra erro. **Fallback:** o `mailto:` direto continua visível na lista de contatos abaixo do form — nunca há dead-end.
- Sem rate-limit sofisticado no MVP (honeypot cobre o caso comum).

## Metadata / SEO / a11y

- title, description, OG tags **verbatim** do protótipo; `favicon.svg`.
- `lang` do `<html>` reflete o idioma ativo.
- Toggles com `aria-label`; `<nav>` semântico; seções com landmarks/headings apropriados.
- `prefers-reduced-motion` respeitado nas animações.

## Testes (nível médio)

- **Vitest (unit):**
  - `calcDuration()`: só meses; 1 ano + meses; plural PT/EN; "presente" vs data final.
  - `contactSchema`: casos válidos e inválidos (nome vazio, e-mail malformado, mensagem vazia, honeypot preenchido).
  - Sanidade i18n: toda chave em `pt.json` existe em `en.json` e vice-versa.
- **Playwright (1 smoke):** página carrega; nome digita; toggle de tema muda `data-theme` no `<html>`; toggle PT/EN troca string visível; âncoras da nav funcionam.
- **Qualidade:** ESLint + Prettier (`prettier-plugin-tailwindcss`), TypeScript strict.

## Assets a portar

- `design/favicon.svg` → `public/favicon.svg`
- `design/public/images/profile-pic.png` → `public/images/profile-pic.png` (grayscale via CSS, não editar imagem)
- Screenshots de projetos: placeholders cinza com label por ora; usuário fornece 280×200 depois.
- Ícones LinkedIn/GitHub: SVGs inline (paths do protótipo), `fill:var(--ink)`.

## Desvios conscientes do README (justificados)

1. **Fonte via `next/font/google`** em vez de `<link>` do Google Fonts — self-hosting, sem render-blocking, mesmo resultado visual.
2. **Formulário via API route + Resend** em vez de `mailto:` — o README explicitamente deixa essa decisão ao desenvolvedor ("pode-se trocar por API route"). `mailto:` mantido como fallback.
3. **`prefers-reduced-motion`** — acréscimo de a11y, não altera o resultado visual final.

## Fora de escopo (YAGNI)

- CMS / data fetching (tudo estático).
- Roteamento por locale (`/pt`, `/en`) — toggle client-side apenas.
- Rate-limiting avançado / captcha (honeypot cobre o MVP).
- Analytics, blog, múltiplas páginas.
