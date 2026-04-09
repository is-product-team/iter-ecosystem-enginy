## Context

In `apps/web/app/[locale]/login/page.tsx`, the logo currently uses the Tailwind class `dark:invert` to adapt to dark mode. This creates a suboptimal visual result for the brand's primary asset.

## Goals / Non-Goals

**Goals:**
- Replace `dark:invert` with explicit asset switching for light/dark modes in the login page.
- Ensure the dedicated `logo-invers.png` asset is used in dark mode.

## Decisions

### 1. Dual Image Implementation with Tailwind Visibility
We will implement two `Image` components instead of one with a CSS filter:
- One for light mode using `block dark:hidden`.
- One for dark mode using `hidden dark:block`.

**Rationale**: This matches the proven pattern in the `Navbar` and allows the browser to download the correct asset based on theme preference (when combined with Next.js image optimization).

## Risks / Trade-offs

- **[Risk] Slight code duplication** → Mitigation: Keep the `Image` props identical except for `src` and visibility classes.
