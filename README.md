# Jonatha Botelho — Portfólio v2

Portfólio pessoal de página única, bilíngue (PT/EN), estética terminal/monospace com
dark mode. Estaticamente gerado (SSG) com Next.js; o conteúdo vem de um CMS caseiro
baseado em Google Sheets + AppSheet + Apps Script, consumido em build-time.

## Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript** (strict)
- **Tailwind CSS v4** (tokens via CSS custom properties, trocados por `[data-theme]`)
- **next-intl 4** (i18n sem roteamento por locale; toggle client-side)
- **Zustand 5** (tema + idioma, persistidos em `localStorage`)
- **React Hook Form 7** + **Zod 4** (formulário de contato)
- **Resend 6** (envio de e-mail via API route)
- **Vitest 4** (unit) · **Playwright** (smoke E2E)

## Desenvolvimento

```bash
pnpm install
pnpm dev            # http://localhost:3000
```

Sem nenhuma variável de ambiente, o site roda com o conteúdo de
`content/fallback.json` (cópia fiel do design). O formulário só envia e-mail de fato
quando `RESEND_API_KEY` está configurada.

### Scripts

| Comando | O que faz |
|---|---|
| `pnpm dev` | Servidor de desenvolvimento |
| `pnpm build` | Build de produção (SSG) |
| `pnpm start` | Serve o build |
| `pnpm test` | Testes unitários (Vitest) |
| `pnpm test:e2e` | Smoke test (Playwright; faz build + start) |
| `pnpm lint` | ESLint |
| `pnpm format` | Prettier |

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

| Var | Uso |
|---|---|
| `RESEND_API_KEY` | Chave da Resend para envio do formulário |
| `CONTACT_TO_EMAIL` | Destino do formulário (default `jonathabotelho1@gmail.com`) |
| `CMS_ENDPOINT_URL` | URL do Web App Apps Script (JSON). Vazio → usa `fallback.json` |
| `CMS_TOKEN` | Token opcional anexado como `?token=` e validado no `doGet` |

### Resend

Crie uma conta em [resend.com](https://resend.com), gere uma API key e coloque em
`RESEND_API_KEY`. Enquanto não houver domínio verificado, o remetente usa
`onboarding@resend.dev` (funciona só para o e-mail da própria conta). Para enviar de um
domínio próprio, verifique o domínio na Resend e ajuste o `from` em
[`app/api/contact/route.ts`](app/api/contact/route.ts).

## Conteúdo (CMS)

Todo o conteúdo editável vem do endpoint definido em `CMS_ENDPOINT_URL`, buscado **uma
vez em build-time**, validado com Zod ([`lib/cms/schema.ts`](lib/cms/schema.ts)) e
transformado em mensagens i18n + dados estruturados
([`lib/cms/transform.ts`](lib/cms/transform.ts)). Se o endpoint falhar, der timeout ou
não validar, o build cai em [`content/fallback.json`](content/fallback.json) — o site
nunca quebra por causa do CMS.

O contrato JSON, o esquema do Google Sheet e o `doGet` de referência estão em
[`apps-script/`](apps-script/README.md).

### Publicando alterações de conteúdo

1. Edite os dados no **AppSheet** (ligado ao Google Sheet).
2. Toque no botão **"atualizar infos do site"** — uma Automation do AppSheet chama o
   **Vercel Deploy Hook**.
3. A Vercel refaz o build; o `getContent()` busca o JSON atualizado. Propagação em
   ~30–60s.

Detalhes de deploy do Web App e configuração do Deploy Hook: veja
[`apps-script/README.md`](apps-script/README.md).

### Imagens dos projetos

As capas dos projetos são placeholders cinza (280×200) até que imagens reais sejam
fornecidas. Para usar uma imagem: coloque o arquivo em `public/images/` e defina
`projects[].imageUrl` no CMS (ex.: `/images/programatical.png`).

## Estrutura

```
app/            layout, page (SSG), globals.css, api/contact
components/      providers, layout, sections, ui, hooks
store/          Zustand UI store (theme, lang)
lib/            duration, month, contact-schema, cms/*
content/        fallback.json (conteúdo versionado)
apps-script/    doGet de referência (fora do build)
__tests__/      Vitest
e2e/            Playwright
```

Especificação de design e plano de implementação:
[`docs/superpowers/`](docs/superpowers/).
