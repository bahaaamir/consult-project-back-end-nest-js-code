# Consulting OS - Brand Identity (v1)

## Product
- Name: Consulting OS
- One-liner: Multi-tenant SaaS to run consulting offices (projects, clients, team, invoices, communication).
- Primary users: Super Admin, Office Owner/Manager/Employee, Client Owner/Employee.

## Brand Personality
- Trustworthy, precise, and "operations-grade" (not playful).
- Modern SaaS feel with a subtle "OS" / system vibe (clean structure, calm surfaces).
- Bilingual-ready (Arabic/English) and RTL-safe spacing.

## Visual Direction
- Style: Deep navy surfaces + bright sky/cyan primary, with an accent green for success states.
- Shape: Slightly rounded (medium radius), sharp typography, strong focus rings.
- Motion: Minimal and respectful (prefers-reduced-motion supported).

## Core Tokens (Implemented)
Defined in `consult-psa/front-end-consult-angular21-code/src/styles/_tokens.scss`.

- Primary: `--app-primary` (Sky/Cyan)
- Accent: `--app-accent` (Green)
- Gradient: `--app-brand-gradient`
- Surfaces: `--app-surface-1/2/3`
- Text: `--app-text-1/2`
- Border: `--app-border-1`
- Focus ring: `--app-focus-ring`
- Shadow: `--app-shadow-1`

## Typography
- Default stack (no web fonts yet): `"IBM Plex Sans", "IBM Plex Sans Arabic", Cairo, system-ui, ...`
- Guidance:
  - Use `UiPageHeader` for page titles (consistent hierarchy).
  - Keep body copy short and scannable, especially for dashboards.

## Logo / Mark
- Temporary mark (implemented in the app shell): a small rounded square using `--app-brand-gradient`.
- Future (optional): replace with a real SVG wordmark + mono icon for sidebar/favicons.

## Layout
- App shell: sticky header, max content width, consistent page padding.
- Auth layout: centered card, minimal distractions.

## Accessibility + RTL
- WCAG AA: focus visible, contrast-first palette, no color-only meaning.
- RTL: prefer logical CSS properties (margin/padding inline start/end) and avoid left/right hard-coding.

