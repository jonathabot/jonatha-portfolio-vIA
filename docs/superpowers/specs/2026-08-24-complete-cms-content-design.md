# Complete CMS Content Contract Design

## Goal

Make `content/fallback.json` the single source of truth for every user-facing
piece of portfolio content. The same JSON shape will be returned by the future
CMS and validated before rendering.

## Scope

Content includes all visible words, personal information, dates, URLs, labels,
breadcrumbs, status messages, section headings, project details, character
specifications, contact channels, and footer information.

Presentation remains in code: layout, Tailwind classes, colors, responsive
breakpoints, animation settings, icons, generated ordinal numbers, and control
behavior.

## Content model

The existing `fallback.json` remains the only fallback file. Its contract will
be expanded with these top-level domains:

- `metadata`: browser title and description.
- `identity`: name, handle, location, languages, professional labels, and links.
- `availability`: availability state, descriptions, and response time.
- `navigation`: route labels and menu metadata.
- `overview`: intro copy, skill groups, annotations, project showcase labels,
  figure caption, and calls to action.
- `experience`: section metadata and complete job records, including display
  period, employment type, location, context, bullets, and technologies.
- `stack`: section metadata and editable skill groups.
- `academics`: section metadata, formal education, certification labels, and
  certificate URLs.
- `projects`: section metadata plus complete list and detail-page content for
  each project.
- `contact`: section metadata, form labels, channels, availability copy, and
  response-time copy.
- `characterStudy`: breadcrumb, heading, figure labels, specification entries,
  status, and return action.
- `footer`: copyright, system label, availability label, and navigation copy.

All language-dependent values use `{ "pt": string, "en": string }`. Values
that do not change by language, such as URLs and asset paths, remain plain
strings.

## Runtime data flow

`getContent()` loads the CMS payload when configured and otherwise imports
`fallback.json`. Both sources are parsed by the same strict Zod schema.

`transform()` produces a complete localized `SiteContent` object for each
language. Components consume semantic fields from this object instead of using
translation arrays aligned by index. Entity records remain grouped so a job or
project cannot accidentally combine content from different entries.

## Component boundaries

- `PortfolioV2` receives the complete localized portfolio content.
- `Header`, section components, cards, contact, character study, and project
  detail receive only the content slices they render.
- Components may generate decorative ordinals such as `01`, but may not contain
  prose, personal facts, dates, URLs, or content labels.
- Technical accessibility labels that describe controls are content when users
  hear them and therefore belong in the JSON.

## Compatibility and migration

The first expanded `fallback.json` preserves the exact information currently
rendered by the site. Content editing happens only after the migration passes,
so structural regressions are distinguishable from copy changes.

The future CMS must return the complete new contract. Invalid or unavailable
CMS responses fall back atomically to the local JSON; partial mixing between a
CMS payload and local content is not allowed.

## Validation and testing

- Schema tests reject missing required content domains and invalid localized
  values.
- Transform tests verify Portuguese and English localization without
  index-based record misalignment.
- Component and E2E tests confirm representative JSON values appear on every
  route.
- A source audit checks V2 components for the known hardcoded content removed
  during migration.
- Existing lint, unit, build, and E2E suites must remain green.

## Non-goals

- Building or selecting the external CMS.
- Defining the CMS vendor's database model.
- Making layout, colors, icons, or animation parameters editable as content.
- Rewriting the current portfolio copy during migration.
