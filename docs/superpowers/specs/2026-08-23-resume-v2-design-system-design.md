# Resume V2 Design System

## Objective

Create a native, connected design system inside `design/resume-v2.pen` and migrate the five portfolio screens to reusable Pencil component instances. A change to a shared master should propagate to every connected screen while screen-specific content remains editable through instance overrides.

## Scope

The design system will live in a dedicated top-level frame named `00 Design System`, positioned above the five 1920×1080 screens. It will preserve the existing visual language, dimensions, content, and assets. This work reorganizes the design; it does not redesign the portfolio or change its copy.

## Foundations

The existing Pencil variables remain the source of truth for colors and fonts. The design-system frame will document:

- Paper, ink, muted, yellow, blue, green, and red color tokens.
- Display, mono, and body typography roles.
- Common strokes, spacing increments, and square-corner conventions.
- Crown, portrait, and decorative graphic assets.

## Component Hierarchy

### Atoms

- Social link
- Technology tag
- Employment/status badge
- Availability indicator
- Primary action button
- Navigation item

### Molecules

- Section heading: index, title, subtitle, and divider
- Skill category block
- Academic or certification card
- Contact detail row
- Project module card

### Organisms

- Global header
- Bottom navigation
- Work-experience entry
- Project showcase rail
- Contact form or transmission panel

### Templates

- Standard internal-page shell containing the global header, 1200 px content region, and bottom navigation.
- Overview keeps its unique three-column composition but consumes shared header, navigation, actions, tags, and project cards.

## Instance Strategy

Each master is a reusable Pencil node. The five screens will use connected `ref` instances instead of detached copies. Per-screen differences will be expressed through descendant overrides, including:

- Active navigation item.
- Page index, title, and subtitle.
- Text content and links.
- Badge labels and accent colors.
- Card content and technology labels.

Structural properties such as typography, spacing, borders, and shared alignment remain controlled by the master component.

## Migration Sequence

1. Create and visually label the `00 Design System` frame.
2. Add foundations and reusable masters without changing the screens.
3. Migrate one representative screen and compare it with the original rendering.
4. Migrate the remaining screens after the representative screen matches.
5. Validate all five screens at 1920×1080 with Pencil screenshots and layout diagnostics.

## Acceptance Criteria

- The file contains a clearly organized design-system frame and reusable masters.
- All repeated screen structures use connected instances where Pencil supports the required overrides.
- The five screens retain their current content and visual appearance.
- Changing a shared master demonstrably propagates to at least two screen instances.
- Screen-specific active navigation and content remain independent.
- Pencil reports no clipped, collapsed, or overflowing layout nodes.

## Boundaries

- No implementation in the Next.js application is included.
- No new visual direction, animation, responsive breakpoint, or content rewrite is included.
- Unique artwork and one-off page compositions remain assets or local structures rather than forced components.
