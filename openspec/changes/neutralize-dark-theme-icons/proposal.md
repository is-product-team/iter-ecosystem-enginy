## Why

The current dark theme implementation uses the institutional dark blue (`#00426b`) for icons on dark backgrounds, which results in poor contrast and a "dirty" look. To align with a premium, Apple-like aesthetic, icons should be neutral (white/high-clarity gray) when on a dark surface, reserved only for high-impact backgrounds or interactive states.

## What Changes

- Standardize all icons in the web frontend to use neutral colors (`text-text-primary` or `white`) instead of institutional blue when in dark mode and on a dark background.
- Update icon containers to use neutral background colors by default in dark mode.
- Maintain the use of institutional blue only as a solid background color (with white content) during active states or hovers to ensure maximum contrast and branding impact.
- Refactor the `CenterDashboard`, `AdminDashboard`, `WorkshopIcon`, and `Reports` components to reflect this neutral-first pattern in dark mode.

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `web`: Redefine the dark mode color hierarchy for icons and interactive elements.

## Impact

- **Affected Code**: `apps/web/app/[locale]/center/page.tsx`, `apps/web/app/[locale]/admin/page.tsx`, `apps/web/components/WorkshopIcon.tsx`, `apps/web/app/[locale]/reports/page.tsx`.
- **Systems**: Web Frontend UI consistency.
- **Dependencies**: None.
