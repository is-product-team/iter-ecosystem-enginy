## Why

The logo in the login page currently uses CSS inversion (`dark:invert`) when the application is in dark mode. This results in poor visual quality and inconsistent branding compared to the dedicated inverted logo asset.

## What Changes

- Update `apps/web/app/[locale]/login/page.tsx` to import both `logo.png` and `logo-invers.png`.
- Replace the single `Image` component using `dark:invert` with two `Image` components that toggle visibility based on the theme, matching the pattern used in the `Navbar`.

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `web`: Standardize theme-aware logo handling in the login page.

## Impact

- **Affected Code**: `apps/web/app/[locale]/login/page.tsx`
- **Systems**: Web Frontend
- **Dependencies**: None
