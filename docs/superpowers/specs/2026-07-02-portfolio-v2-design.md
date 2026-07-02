# Design: Portfólio Jonatha Botelho v2 (Next.js + Tailwind)

**Data:** 2026-07-02
**Fonte do design:** `design_handoff_portfolio_v2/README.md` + protótipo `design/Jonatha Botelho - Portfolio v2.dc.html`
**Fidelidade:** High-fidelity (hifi) — cores, tipografia, espaçamentos, copy e interações são finais.

## Objetivo

Recriar o design "terminal/typewriter" do handoff v2 como um projeto Next.js novo, limpo e de produção — página única, bilíngue (PT/EN), dark mode, animação de digitação no nome e sweep nos destaques do resumo. O conteúdo é gerido por um **CMS caseiro baseado na stack Google Workspace do próprio Jonatha** (Google Sheets + AppSheet + Apps Script), consumido pelo site em build-time — decisão que também serve de case de portfólio.

> **Desvio deliberado do README:** o handoff pede conteúdo estático/hardcoded ("sem CMS"). O dono do projeto (Jonatha) optou por um CMS próprio para (a) editar o conteúdo sem tocar em código e (b) demonstrar a stack Google Workspace que ele vende profissionalmente. Instrução do usuário prevalece sobre o README. O site permanece **estaticamente gerado** (SSG) — o CMS alimenta o build, não o runtime.

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
| **CMS** | **Google Sheets (BD) + AppSheet (admin, montado por Jonatha) + Apps Script (`doGet` JSON)** |
| **Consumo do CMS** | **Build-time fetch (SSG)** do JSON, com `fallback.json` commitado |
| **Publicação** | Botão AppSheet → **Vercel Deploy Hook** → rebuild |
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
- **Conteúdo**: buscado uma vez em **build-time** do endpoint Apps Script (SSG), transformado em `messages` (next-intl) + `content` e injetado nas páginas/componentes. Não há fetch em runtime no cliente — o site servido é estático. Ver seção "CMS & pipeline de conteúdo".

## Estrutura de pastas

```
jonatha-portfolio-v2/
├─ app/
│  ├─ layout.tsx              # <html>, Courier Prime, script anti-flash inline, metadata/OG
│  ├─ page.tsx                # monta seções em ordem; providers
│  ├─ globals.css             # @theme Tailwind v4, tokens, [data-theme="dark"]
│  └─ api/contact/route.ts    # POST → valida (Zod) → envia (Resend)
├─ components/
│  ├─ providers/IntlProvider.tsx   # recebe {pt,en} do server; lê lang do store → NextIntlClientProvider
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
│  ├─ month.ts                     # formatMonthYear(iso, lang) — "ago 2024" / "Aug 2024"
│  ├─ contact-schema.ts            # Zod schema do formulário (client+server)
│  └─ cms/
│     ├─ schema.ts                 # Zod schema do contrato CMS (Loc, PortfolioContent)
│     ├─ fetch.ts                  # getContent(): fetch build-time + fallback + validação
│     ├─ transform.ts              # split JSON → { messages: {pt,en}, content }
│     └─ summary.ts                # parseSummary(): [[...]] → segmentos + destaques
├─ content/
│  └─ fallback.json                # último JSON bom commitado (seed do protótipo)
├─ public/favicon.svg
├─ public/images/profile-pic.png
├─ apps-script/
│  └─ Code.gs                      # doGet de referência (NÃO faz parte do build do site)
├─ __tests__/                      # Vitest
└─ e2e/                            # Playwright smoke
```

> `messages/` e `content/portfolio.ts` **deixam de existir como arquivos hand-authored** — as mensagens do next-intl e os dados estruturados passam a ser **derivados em build-time** do JSON do CMS (via `lib/cms/`). O `fallback.json` é a única fonte de conteúdo versionada no repo, e serve tanto de seed inicial quanto de rede de segurança.

### Fluxo de dados do conteúdo (build-time)

1. `lib/cms/fetch.ts::getContent()` roda no servidor (build/SSG): `fetch(CMS_ENDPOINT_URL)` com timeout curto.
2. Resposta validada contra `lib/cms/schema.ts` (Zod). Se o fetch falhar, der timeout ou não validar → usa `content/fallback.json` (também validado). Nunca quebra o build.
3. `lib/cms/transform.ts` divide o `PortfolioContent` validado em:
   - `messages.pt` / `messages.en` → objetos no formato next-intl (só os campos `Loc`, achatados por idioma).
   - `content` → dados estruturados neutros de idioma (URLs, datas ISO, techs, flags).
4. `page.tsx` (Server Component) chama `getContent()` uma vez, passa `messages[lang]` ao `NextIntlClientProvider` e `content` às seções.
5. **Sem fetch em runtime no cliente.** O toggle PT/EN só troca qual sub-árvore de `messages` já embarcada é exibida (ambos os idiomas vêm no payload SSG).

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

## CMS & pipeline de conteúdo

### Visão geral do pipeline

```
[Google Sheets]  --edita-->  [AppSheet]  (Jonatha monta)
      |                           |
      | Apps Script doGet         | botão "atualizar infos do site"
      | (Web App, JSON)           | (AppSheet Automation)
      v                           v
   CMS_ENDPOINT_URL         Vercel Deploy Hook (URL secreta)
      |                           |
      |  build-time fetch         |  dispara rebuild
      +--------> [Next.js SSG] <--+
```

- **Fronteira Jonatha × site:** Jonatha constrói o Sheet, o AppSheet e a Automation do botão. O site depende apenas de **duas URLs**: `CMS_ENDPOINT_URL` (o Web App do Apps Script que devolve o JSON) e o **Vercel Deploy Hook** (configurado na Vercel, chamado pela Automation do AppSheet). Ambas em variáveis de ambiente / config, nunca hardcoded.
- **Autenticação do endpoint:** o `doGet` aceita um `?token=...` opcional; se `CMS_TOKEN` estiver definido no ambiente do site, o fetch o inclui e o `doGet` valida. Mantém o endpoint fora de indexação casual sem exigir OAuth.

### Contrato JSON (fonte da verdade do formato)

`Loc<T> = { pt: T; en: T }`. Campos `Loc` = traduzíveis (2 colunas no Sheet). Demais = string/valor fixo. Zod schema em `lib/cms/schema.ts` valida exatamente esta forma:

```jsonc
{
  "meta": {
    "nowUpdated": { "pt": "última atualização: jul 2026", "en": "last updated: Jul 2026" },
    "footer":     { "pt": "© 2026 Jonatha Botelho. Todos os direitos reservados.",
                    "en": "© 2026 Jonatha Botelho. All rights reserved." }
  },
  "flags": { "showEducation": true, "showPhoto": true },
  "nav": {
    "tools":    { "pt": "ferramentas", "en": "toolkit" },
    "exp":      { "pt": "experiência", "en": "experience" },
    "projects": { "pt": "projetos",    "en": "projects" },
    "contact":  { "pt": "contato",     "en": "contact" }
  },
  "hero": {
    "hello": { "pt": "olá, meu nome é", "en": "hello, my name is" },
    "role":  { "pt": "Desenvolvedor Google Cloud & Google Workspace | Analista de Dados",
               "en": "Google Cloud & Google Workspace Developer | Data Analyst" },
    // resumo: 1 string por idioma; destaques (sweep) marcados com [[...]] na ORDEM.
    "summary": {
      "pt": "Mais de 3 anos ... Google Cloud e [[Google Workspace]]. Automação de processos com [[Apps Script]], ... No front-end: [[React]], Next.js, TypeScript e Tailwind CSS. ...",
      "en": "3+ years ... Google Cloud and [[Google Workspace]]. Process automation with [[Apps Script]], ... Front-end work with [[React]], Next.js, TypeScript and Tailwind CSS. ..."
    },
    "cta":   { "pt": "Entre em contato", "en": "Get in touch" },
    "techs": ["Apps Script","AppSheet","BigQuery","Looker Studio","Cloud Run","React","TypeScript"],
    "links": {
      "email":    "jonathabotelho1@gmail.com",
      "linkedin": "https://linkedin.com/in/jonathabotelho",
      "github":   "https://github.com/jonathabot"
    },
    "photoUrl": "/images/profile-pic.png"
  },
  "now": {
    "items": [
      { "pt": "Desenvolvendo features para a Stinx Network ...", "en": "Building features for Stinx Network ..." },
      { "pt": "Aprofundando arquitetura de microsserviços ...",  "en": "Going deeper into microservice architecture ..." },
      { "pt": "Explorando agentes de IA ...",                    "en": "Exploring AI agents ..." }
    ]
  },
  "tools": [
    { "name": { "pt": "Front-end", "en": "Front-end" },
      "items": { "pt": "JavaScript · TypeScript · ...", "en": "JavaScript · TypeScript · ..." } }
    // ... 5 categorias
  ],
  "experience": [
    {
      "company": "Gentrop",              // fixo
      "start": "2024-08-01",             // ISO; formatação e duração no site
      "end": null,                       // null = presente
      "role":  { "pt": "Desenvolvedor Google Workspace", "en": "Google Workspace Developer" },
      "techs": ["Apps Script","AppSheet","BigQuery","Cloud Run","Looker Studio","GCP"],
      "bullets": [
        { "head": { "pt": "Montadora de veículos:", "en": "Automotive manufacturer:" },
          "text": { "pt": "integração ...", "en": "data integration ..." } }
        // ...
      ]
    }
    // ... Mundo Móveis: start "2023-01-01", end "2024-08-01"
  ],
  "projects": [
    {
      "imageUrl": null,                          // null → placeholder cinza com label
      "repoUrl": "https://github.com/jonathabot/programatical", // null → sem "ver projeto"
      "title":     { "pt": "Programatical — ...", "en": "Programatical — ..." },
      "dateLabel": { "pt": "2025 · TCC",          "en": "2025 · Capstone" },
      "desc":      { "pt": "Trabalho de Conclusão ...", "en": "Capstone project ..." },
      "stack": [
        { "k": { "pt": "Core", "en": "Core" }, "v": { "pt": "Next.js 14 ...", "en": "Next.js 14 ..." } }
        // ...
      ]
    }
    // ... Stinx, jonatha-portfolio v1 (ordem preservada)
  ],
  "education": {
    "degree":    { "pt": "Tecnólogo em Sistemas para Internet", "en": "Associate Degree in Internet Systems" },
    "school":    { "pt": "Instituto Federal de São Paulo (IFSP), Campus Birigui",
                   "en": "Federal Institute of São Paulo (IFSP), Birigui Campus" },
    "degreeYear":{ "pt": "concluído em 2025", "en": "completed 2025" },
    "langLine":  { "pt": "Português nativo · Inglês avançado", "en": "Native Portuguese · Advanced English" },
    "langCert":  { "pt": "C1 Advanced — EF SET", "en": "C1 Advanced — EF SET" }
  },
  "form": {
    "name":    { "pt": "Nome",    "en": "Name" },
    "email":   { "pt": "E-mail",  "en": "E-mail" },
    "message": { "pt": "Mensagem","en": "Message" },
    "send":    { "pt": "ENVIAR MENSAGEM", "en": "SEND MESSAGE" },
    "cta":     { "pt": "Entre em contato →", "en": "Get in touch →" }
  }
}
```

Todo o texto acima é preenchido **verbatim** do dicionário `strings()` do protótipo (fragmentos abreviados no spec com `...`; o `fallback.json` traz o conteúdo completo).

### `summary` com marcadores `[[...]]`

- `lib/cms/summary.ts::parseSummary(raw: string)` → `Array<{ text: string; highlight: boolean }>`, dividindo em `[[...]]`.
- No `Hero`, segmentos `highlight:true` viram spans com o efeito *sweep* (na ordem em que aparecem: 1º=delay 400ms, 2º=1000ms, 3º=1600ms). Segmentos normais = texto puro.
- As palavras destacadas (Google Workspace, Apps Script, React) ficam literais dentro do texto (não se traduzem), mas o texto ao redor é traduzido.

### Transformação build-time (`lib/cms/transform.ts`)

- Entrada: `PortfolioContent` validado.
- Saída `messages`: para cada idioma, um objeto plano no formato next-intl contendo **apenas os campos `Loc` achatados** — ex.: `messages.pt.hero.role`, `messages.pt.now.items.0`, `messages.pt.tools.0.name`. Estrutura espelha o contrato mas sem o wrapper `{pt,en}`.
- Saída `content`: campos neutros de idioma — `hero.techs`, `hero.links`, `hero.photoUrl`, `experience[].{company,start,end,techs}`, `projects[].{imageUrl,repoUrl}`, `flags`. As seções recebem `content` por props e as strings via `useTranslations()`.
- `summary` é `Loc<string>` (fica em `messages`); o `Hero` chama `parseSummary(t('hero.summary'))`.

### `getContent()` (`lib/cms/fetch.ts`) — resiliência

```ts
// pseudocódigo
async function getContent(): Promise<PortfolioContent> {
  try {
    const url = CMS_ENDPOINT_URL + (CMS_TOKEN ? `?token=${CMS_TOKEN}` : '');
    const res = await fetch(url, { signal: AbortSignal.timeout(5000),
                                   next: { revalidate: false } });   // build-time, sem cache runtime
    if (!res.ok) throw new Error(`CMS ${res.status}`);
    return portfolioSchema.parse(await res.json());
  } catch (e) {
    console.warn('[cms] fallback:', e);
    return portfolioSchema.parse(fallbackJson);   // fallback.json commitado
  }
}
```

- Se `CMS_ENDPOINT_URL` não estiver definido (ex.: primeiro dev local antes do Sheet existir) → usa direto o `fallback.json`. **O site funciona 100% sem o CMS configurado.**

### Apps Script `doGet` de referência (`apps-script/Code.gs`)

- Fornecido como referência para Jonatha colar no projeto Apps Script vinculado ao Sheet.
- Lê as abas do Sheet, monta o objeto no contrato acima e retorna `ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(JSON)`.
- Valida `?token` contra uma constante, se configurado.
- **Não faz parte do build/deploy do site** (pasta `apps-script/` é só documentação/entrega).

### Publicação (Deploy Hook)

- Jonatha cria um Deploy Hook na Vercel (Project → Settings → Git → Deploy Hooks) → obtém URL secreta.
- Na Automation do AppSheet, o botão "atualizar infos do site" dispara um passo **Webhook** (`POST` para a URL do Deploy Hook) — não precisa de Apps Script para o gatilho (embora pudesse). A Vercel rebuilda; `getContent()` re-busca o JSON atualizado.
- Documentado no `README.md` do projeto (seção "Publicando alterações de conteúdo").

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
  - `formatMonthYear()`: "ago 2024" / "Aug 2024" para as mesmas datas.
  - `contactSchema`: casos válidos e inválidos (nome vazio, e-mail malformado, mensagem vazia, honeypot preenchido).
  - `portfolioSchema` (contrato CMS): aceita um payload válido; rejeita payload malformado (campo `Loc` faltando idioma, `start` não-ISO).
  - `parseSummary()`: string sem marcadores → 1 segmento normal; com 3 `[[...]]` → 6 segmentos alternando; ordem/flags corretos.
  - `transform()`: dado `PortfolioContent`, produz `messages.pt`/`messages.en` com as chaves esperadas e `content` sem campos `Loc`.
  - `getContent()`: endpoint OK → usa resposta; endpoint 500/timeout/JSON inválido → cai no `fallback.json` (mockar `fetch`).
  - Sanidade i18n: `messages.pt` e `messages.en` derivados do `fallback.json` têm exatamente o mesmo conjunto de chaves.
- **Playwright (1 smoke):** página carrega; nome digita; toggle de tema muda `data-theme` no `<html>`; toggle PT/EN troca string visível; âncoras da nav funcionam.
- **Qualidade:** ESLint + Prettier (`prettier-plugin-tailwindcss`), TypeScript strict.

## Assets a portar

- `design/favicon.svg` → `public/favicon.svg`
- `design/public/images/profile-pic.png` → `public/images/profile-pic.png` (grayscale via CSS, não editar imagem)
- Screenshots de projetos: placeholders cinza com label por ora; usuário fornece 280×200 depois.
- Ícones LinkedIn/GitHub: SVGs inline (paths do protótipo), `fill:var(--ink)`.

## Variáveis de ambiente

| Var | Onde | Uso |
|---|---|---|
| `RESEND_API_KEY` | site (server) | envio do formulário via Resend |
| `CONTACT_TO_EMAIL` | site (server) | destino do formulário (default `jonathabotelho1@gmail.com`) |
| `CMS_ENDPOINT_URL` | site (build) | URL do Web App Apps Script (JSON). Ausente → usa `fallback.json` |
| `CMS_TOKEN` | site (build) + Apps Script | token opcional anexado como `?token=` e validado no `doGet` |

Documentadas em `.env.example`. O Deploy Hook da Vercel **não** é var do site — vive na Vercel e é chamado pela Automation do AppSheet.

## Desvios conscientes do README (justificados)

1. **CMS próprio (Sheets + AppSheet + Apps Script)** em vez de conteúdo estático hardcoded — decisão do dono do projeto para editar conteúdo sem código e demonstrar sua stack Google Workspace. O site continua SSG; o CMS alimenta o build. Fidelidade visual/copy inalterada (o `fallback.json` nasce verbatim do protótipo).
2. **Fonte via `next/font/google`** em vez de `<link>` do Google Fonts — self-hosting, sem render-blocking, mesmo resultado visual.
3. **Formulário via API route + Resend** em vez de `mailto:` — o README explicitamente deixa essa decisão ao desenvolvedor ("pode-se trocar por API route"). `mailto:` mantido como fallback.
4. **`prefers-reduced-motion`** — acréscimo de a11y, não altera o resultado visual final.

## Fora de escopo (YAGNI)

- Fetch de conteúdo em **runtime** no cliente — o CMS é consumido só em build-time (SSG).
- On-demand ISR / revalidate no site — publicação via Deploy Hook (rebuild) é suficiente.
- Roteamento por locale (`/pt`, `/en`) — toggle client-side apenas.
- Rate-limiting avançado / captcha (honeypot cobre o MVP).
- Construção do Sheet/AppSheet/Automation — feita por Jonatha; o site entrega o contrato JSON + `doGet` de referência.
- Analytics, blog, múltiplas páginas.
