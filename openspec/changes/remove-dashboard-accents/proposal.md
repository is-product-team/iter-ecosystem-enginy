## Why

The current dashboard cards for coordination and administration include decorative accents (diagonal "picos" and side ribbons) and hover border thickness increases that the user finds distracting and unattractive. Standardizing the cards to a cleaner, border-only look aligns better with the desired minimalist aesthetic.

## What Changes

- Remove the diagonal decorative "pico" (absolute positioned `div` with `rotate-45`) from cards in `apps/web/app/[locale]/center/page.tsx`.
- Remove the blue side ribbon (absolute positioned `div`) from cards in `apps/web/app/[locale]/admin/page.tsx`.
- Standardize the hover border color to `consorci-darkBlue` without increasing the border width or adding decorative elements.

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `web`: Refine the visual design of dashboard navigation cards.

## Impact

- **Affected Code**: `apps/web/app/[locale]/center/page.tsx`, `apps/web/app/[locale]/admin/page.tsx`.
- **Systems**: Web Frontend UI.
- **Dependencies**: None.
