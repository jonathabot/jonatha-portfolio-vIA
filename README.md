# Jonatha Botelho - Portfolio v2

A bilingual (EN/PT), single-page personal portfolio with a terminal-inspired,
monospace aesthetic and dark mode. The site is statically generated (SSG) with
Next.js. Its content can be supplied at build time by an external CMS endpoint.

## Tech stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript** (strict mode)
- **Tailwind CSS v4** (CSS custom-property tokens switched through `[data-theme]`)
- **next-intl 4** (client-side internationalization without locale routing)
- **Zustand 5** (theme and language persisted in `localStorage`)
- **React Hook Form 7** + **Zod 4** (contact form)
- **Resend 6** (email delivery through an API route)
- **Vitest 4** (unit tests) · **Playwright** (E2E smoke tests)

## Development

```bash
pnpm install
pnpm dev            # http://localhost:3000
```

The site runs without environment variables by using the versioned content in
`content/fallback.json`. The contact form only sends email when `RESEND_API_KEY` is
configured.

### Scripts

| Command         | Description                                   |
| --------------- | --------------------------------------------- |
| `pnpm dev`      | Start the development server                  |
| `pnpm build`    | Create the production build (SSG)             |
| `pnpm start`    | Serve the production build                    |
| `pnpm test`     | Run unit tests with Vitest                    |
| `pnpm test:e2e` | Run the Playwright smoke test (build + start) |
| `pnpm lint`     | Run ESLint                                    |
| `pnpm format`   | Format the project with Prettier              |

## Environment variables

Copy `.env.example` to `.env.local` and provide the required values:

| Variable           | Purpose                                                               |
| ------------------ | --------------------------------------------------------------------- |
| `RESEND_API_KEY`   | Resend API key used by the contact form                               |
| `CONTACT_TO_EMAIL` | Contact-form recipient (defaults to `jonathabotelho1@gmail.com`)      |
| `CMS_ENDPOINT_URL` | CMS endpoint that returns JSON; empty uses `fallback.json`             |
| `CMS_TOKEN`        | Optional token appended to the CMS request as `?token=`                |

### Resend

Create an account at [resend.com](https://resend.com), generate an API key, and assign
it to `RESEND_API_KEY`. Until a domain is verified, the sender is
`onboarding@resend.dev`, which can only deliver to the email address associated with
the Resend account. To send from a custom domain, verify it in Resend and update the
`from` field in [`app/api/contact/route.ts`](app/api/contact/route.ts).

## Content and CMS

Editable content can come from the endpoint configured through `CMS_ENDPOINT_URL`.
The endpoint is fetched **once at build time**, validated with Zod
([`lib/cms/schema.ts`](lib/cms/schema.ts)), and transformed into internationalized
messages and structured data ([`lib/cms/transform.ts`](lib/cms/transform.ts)). If the
endpoint fails, times out, or returns invalid data, the build falls back to
[`content/fallback.json`](content/fallback.json), preventing a CMS failure from
breaking the site.

### Publishing content changes

1. Publish the updated data through the configured CMS.
2. Trigger a new deployment through the hosting provider.
3. During the build, `getContent()` fetches and validates the updated JSON.

### Project images

Project covers use gray 280×200 placeholders until real images are provided. To add
an image, place it in `public/images/` and set `projects[].imageUrl` in the CMS, for
example `/images/programatical.png`.

## Project structure

```text
app/            Layout, page, global styles, and contact API route
components/     Providers, layouts, sections, UI elements, and hooks
store/          Zustand UI store for theme and language
lib/            Date utilities, validation, and CMS logic
content/        Versioned fallback content
__tests__/      Vitest unit tests
e2e/            Playwright end-to-end tests
```
