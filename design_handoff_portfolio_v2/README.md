# Handoff: Portfolio Jonatha Botelho v2 (terminal/monospace + dark mode)

## Overview
Portfólio pessoal de página única para Jonatha Botelho — Desenvolvedor Google Cloud & Google Workspace | Analista de Dados. Estética "terminal/typewriter" minimalista: monospace, preto-e-branco, bordas duplas e tracejadas, sem cores de destaque. Bilíngue (PT/EN) com toggle, dark mode com toggle, animação de digitação no nome e "sweep" de destaque em palavras-chave do resumo.

## About the Design Files
Os arquivos em `design/` são **referências de design em HTML** (protótipo), não código de produção. A tarefa é **recriar este design no codebase alvo** — um projeto Next.js/React/TypeScript/Tailwind (o repositório do portfolio v1 do usuário já usa Next.js App Router; recomenda-se um projeto Next.js novo e limpo, sem o CMS Hygraph — todo o conteúdo desta versão é estático/hardcoded ou em arquivos de i18n locais).

Abra `design/Jonatha Botelho - Portfolio v2.dc.html` no navegador para ver o protótipo funcionando (os arquivos `support.js` e `image-slot.js` são o runtime do protótipo — ignore-os na implementação).

## Fidelity
**High-fidelity (hifi).** Cores, tipografia, espaçamentos, copy e interações são finais. Recriar pixel-perfect usando Tailwind (ou CSS modules), respeitando os tokens abaixo.

## Design Tokens

### Cores — implementadas como CSS custom properties, trocadas por `[data-theme="dark"]` no `<html>`
| Token | Light | Dark | Uso |
|---|---|---|---|
| `--bg` | `#ffffff` | `#0d0d0d` | fundo da página; texto sobre superfícies "ink" (botões) |
| `--ink` | `#111111` | `#ececec` | texto principal, bordas fortes, botões, links |
| `--body` | `#444444` | `#b0b0b0` | corpo de texto secundário |
| `--dim` | `#666666` | `#8f8f8f` | texto terciário (labels, footer, stack) |
| `--faint` | `#999999` | `#6f6f6f` | datas, metadados, bordas de chips secundários |
| `--idle` | `#bbbbbb` | `#555555` | opção de idioma inativa |
| `--hair` | `#cccccc` | `#3a3a3a` | linha vertical da timeline |

`body { background: var(--bg); transition: background .25s; }` — só o background tem transition; textos trocam instantaneamente.

### Tipografia
- Família única: **Courier Prime** (Google Fonts; pesos 400 e 700, itálico 400) — usada em TUDO, inclusive inputs e botões.
- Escala: h1 nome 38px/700; CTA contato 22px/700; títulos de item (cargo, projeto) 17px/700 sublinhado (thickness 2px, underline-offset 5px); corpo 15–16px, line-height 1.65–1.7; nav/links 14px; metadados/datas 13px; stack de projeto 13px; footer e "última atualização" 12px.

### Bordas / sombras / raios
- **Raio zero em tudo** (estética terminal).
- Borda dupla: `border-bottom: 3px double var(--ink)` (fim do hero) e `border-top: 3px double var(--ink)` (footer).
- Divisores de seção: `border-bottom: 1px dashed var(--faint)`.
- Foto do hero: `border: 1px solid var(--ink)`, sombra dura `box-shadow: 10px 10px 0 var(--ink)`, `filter: grayscale(1) contrast(1.05)`.
- Imagens de projeto: `border: 1px solid var(--ink)`, `filter: grayscale(1)`.
- Chips do hero: `border: 1px solid var(--ink)`, padding `2px 10px`, 13px. Chips de tech por experiência: `border: 1px solid var(--faint)`, cor `var(--body)`, padding `1px 8px`, 12px.
- Links de texto: sempre `text-decoration: underline; text-underline-offset: 4px`, cor `var(--ink)`.

### Espaçamento
Container central: `max-width: 820px`, padding lateral 32px, topo 40px. Seções: padding vertical 40px (contato 44px/56px). Hero: padding `64px 0 52px`, gap 48px. Lista de projetos: gap 44px entre projetos. Experiências: gap 40px.

## Layout / Screens (página única, seções em ordem)

1. **Header/nav** — flex space-between, baseline. Esquerda: `jonatha.botelho_` (14px, 700). Direita (gap 22px): links âncora `ferramentas / experiência / projetos / contato` (sublinhados) + `[ PT / EN ]` + `[☾]`/`[☀]` (toggle de tema). Idioma ativo: `var(--ink)`, 700, sublinhado; inativo: `var(--idle)`.
2. **Hero** — flex 2 colunas (texto flex:1 min-width 380px; foto 240×240 à direita, some em telas estreitas via wrap). "olá, meu nome é" (14px, `--dim`) → **JONATHA BOTELHO** com efeito de digitação + cursor `_` piscando → cargo (16px, `--body`) → parágrafo-resumo com 3 palavras destacadas por sweep animado (Google Workspace, Apps Script, React) → linha de chips de techs → CTA "Entre em contato →" (bloco `background: var(--ink); color: var(--bg)`, 10px 20px, 14px 700) + links `/linkedin` e `/github` com ícones SVG 16px preenchidos com `var(--ink)`.
3. **00 — AGORA_** — título de seção (15px 700, prefixo numérico `NN — NOME_`) + "última atualização: jul 2026" à direita (12px `--faint`). Lista de 3 itens com marcador `▸` em `var(--ink)` 700.
4. **01 — FERRAMENTAS_** — grid `190px 1fr` por linha: `→ Categoria` (700) | lista de techs separadas por ` · ` (cor `--body`).
5. **02 — EXPERIÊNCIA_** — timeline: coluna 14px com quadrado 9×9 `var(--ink)` + linha vertical 1px `var(--hair)`; conteúdo com cargo|empresa (17px 700 sublinhado) e período à direita (13px `--faint`, inclui duração calculada dinamicamente, ex.: "ago 2024 — presente · 1 ano e 11 meses"); bullets com `·` e lead em 700; chips de techs.
6. **03 — PROJETOS_** — 3 projetos, cada um grid `280px 1fr` gap 28px: imagem 280×200 (grayscale) | título sublinhado + data à direita + descrição + stack em linhas `Chave: valor` (13px) + link "ver projeto →" quando houver repo. Ordem: **Programatical (TCC, 2025)** → Stinx Network (2025—presente) → jonatha-portfolio v1 (2023).
7. **04 — FORMAÇÃO_** — duas linhas space-between: graduação/instituição + ano; idiomas + certificação.
8. **05 — CONTATO_** — CTA 22px 700 + formulário (max-width 480px): inputs e textarea com `border: 1px solid var(--ink)`, `background: var(--bg)`, padding `12px 14px`, monospace, sem raio, sem resize; botão "ENVIAR MENSAGEM →" estilo do CTA do hero. Abaixo, e-mail + linkedin + github (gap 28px).
9. **Footer** — borda dupla no topo; © à esquerda, `made by ♥ jonatha.botelho_` à direita (12px, `--dim`).

## Interactions & Behavior
- **Digitação do nome**: "JONATHA BOTELHO" digitado caractere a caractere, 85ms por letra, ao montar. Cursor `_` pisca em step (opacity 1↔0 a cada 500ms, animação de 1s infinita).
- **Sweep dos destaques**: 3 spans do resumo animam `background-size` de `0% 100%` a `100% 100%` (background `linear-gradient(var(--ink),var(--ink))`, no-repeat), com a cor do texto virando `var(--bg)` a ~60% da animação. Duração 600ms ease-out, delays 400/1000/1600ms, `fill: forwards`. Roda uma vez ao montar.
- **Toggle PT/EN**: troca todas as strings (dicionário i18n completo está no protótipo — copiar dele). Persistir em `localStorage` chave `jb-portfolio-lang`.
- **Toggle de tema**: `[☾]` no claro / `[☀]` no escuro; seta `data-theme` no `<html>`; persistir em `localStorage` chave `jb-portfolio-theme`. Padrão: light. Hover do toggle: cor `var(--ink)`.
- **Durações de experiência**: calculadas em runtime a partir das datas (início Gentrop 2024-08; Mundo Móveis 2023-01 a 2024-08), formatadas por idioma ("1 ano e 11 meses" / "1 yr 11 mos").
- **Formulário de contato**: no protótipo abre `mailto:jonathabotelho1@gmail.com` com subject/body montados a partir dos campos. Na implementação real, pode-se trocar por API route — decisão do desenvolvedor/usuário.
- **Nav**: âncoras `#ferramentas #experiencia #projetos #contato` com scroll padrão.
- Sem outras animações de scroll/hover — a estética é seca de propósito.

## State Management
- `lang: 'pt' | 'en'` (default 'pt', persistido)
- `theme: 'light' | 'dark'` (default 'light', persistido, aplicado como atributo no `<html>` antes do paint para evitar flash — usar script inline no `<head>`)
- `typed: number` (progresso da digitação)
- Sem data fetching; todo conteúdo estático.

## Conteúdo / Copy
Todo o copy final (PT e EN) está no dicionário `strings()` dentro do arquivo HTML de referência — usar verbatim. Inclui: nav, hero, 3 itens de "agora", 5 categorias de ferramentas, 2 experiências com bullets, 3 projetos com descrições e stacks, formação, contato e footer.

## Assets
- `design/favicon.svg` — favicon.
- `design/public/images/profile-pic.png` — foto do hero (aplicar grayscale via CSS, não editar a imagem).
- Screenshots dos projetos (Programatical, Stinx, portfolio v1): **placeholders no protótipo** — o usuário fornecerá as imagens reais (280×200, exibidas em grayscale).
- Ícones LinkedIn/GitHub: SVGs inline de 24×24 (paths completos no HTML de referência), `fill: var(--ink)`.

## Files
- `design/Jonatha Botelho - Portfolio v2.dc.html` — protótipo completo (layout + copy PT/EN + lógica de tema/idioma/animações).
- `design/support.js`, `design/image-slot.js` — runtime do protótipo, apenas para abrir o HTML localmente; não portar.
- `design/favicon.svg`, `design/public/images/` — assets a portar.
