## Why

The current Phase Management page (`apps/web/app/[locale]/phases/page.tsx`) uses an outdated design language with heavy weights (`font-black`), forced uppercase text, and non-standard border widths. This clashes with the "Minimalist Sharp" (Apple-style) aesthetic implemented across the rest of the web application.

## What Changes

- Refactor `apps/web/app/[locale]/phases/page.tsx` to use the standardized design system.
- Replace `font-black` and `uppercase` with `font-medium` and standard capitalization for a professional look.
- Update cards to use `border-border-subtle` and consistent padding.
- Standardize the active phase indicator using theme colors (`consorci-darkBlue`) without using oversized border-lefts.
- Clean up icons and input styles to match the rest of the platform.
- Ensure the page uses the `w-full pb-20 space-y-12` root container pattern.

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `web`: Modernize the administrative Phase Management interface.

## Impact

- **Affected Code**: `apps/web/app/[locale]/phases/page.tsx`.
- **Systems**: Web Frontend (Admin section).
- **Dependencies**: None.
