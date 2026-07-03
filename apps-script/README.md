# CMS via Google Sheets + AppSheet + Apps Script

This folder is **reference material**, not part of the site build. It documents how
to wire the homegrown CMS that feeds the portfolio at build time.

## Pipeline

```
Google Sheets  --edit-->  AppSheet (admin UI)
     |                        |
     | Apps Script doGet      | button "atualizar infos do site"
     | (Web App, JSON)        | (AppSheet Automation → Webhook)
     v                        v
CMS_ENDPOINT_URL         Vercel Deploy Hook (secret URL)
     |                        |
     |  build-time fetch      |  triggers rebuild
     +------->  Next.js  <-----+
```

The site depends on only two URLs:

- **`CMS_ENDPOINT_URL`** — the Apps Script Web App `/exec` URL that returns the JSON.
- **Vercel Deploy Hook** — created in Vercel, called by AppSheet to trigger a rebuild.

## The JSON contract

The `doGet` must return the exact shape validated by `lib/cms/schema.ts`. The full
contract is in `docs/superpowers/specs/2026-07-02-portfolio-v2-design.md`
("Contrato JSON"), and `content/fallback.json` is a complete, valid example — start
from it.

Conventions:

- Translatable fields are `{ "pt": "...", "en": "..." }`; everything else is a plain value.
- The hero `summary` is one string per language with the three highlighted terms wrapped
  in `[[...]]` (e.g. `... e [[Google Workspace]]. ...`).
- Experience dates are ISO `YYYY-MM-DD` (`end: null` = present). The site formats months
  and computes tenure — do not store the duration text.
- `flags.showEducation` / `flags.showPhoto` toggle sections without code changes.

## Authoring options

1. **Single-cell JSON (fastest to start):** a tab named `payload` with the full JSON in
   cell `A1`. `Code.gs` reads and returns it verbatim. Edit the JSON through an AppSheet
   view bound to that cell.
2. **Per-tab (cleaner long term):** one tab per content type (`meta`, `hero`, `tools`,
   `experience`, `projects`, …) and expand `buildPayload_()` to assemble the contract.

## Deploy the Web App

1. In the Sheet: **Extensions → Apps Script**, paste `Code.gs`.
2. **Deploy → New deployment → Web app**, Execute as **Me**, Access **Anyone**.
3. Copy the `/exec` URL → set it as `CMS_ENDPOINT_URL` in the site (Vercel env).
4. (Optional) Set `TOKEN` in `Code.gs` and `CMS_TOKEN` in the site to the same value;
   the site appends `?token=…` and `doGet` validates it.

## Publish button (Deploy Hook)

1. In Vercel: **Project → Settings → Git → Deploy Hooks**, create one, copy the URL.
2. In AppSheet: add an **Automation** with a **Webhook** step that does `POST` to that URL,
   triggered by the "atualizar infos do site" action button.
3. Pressing the button rebuilds the site; `getContent()` re-fetches the updated JSON.
   Propagation takes ~30–60s (a full rebuild).

If the endpoint is ever down or misconfigured, the build falls back to the committed
`content/fallback.json`, so the site never breaks.
