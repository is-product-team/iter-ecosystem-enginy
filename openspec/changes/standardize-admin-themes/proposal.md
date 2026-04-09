## Why

The admin section contains many hardcoded colors (e.g., `bg-white`, `border-gray-200`, `text-gray-700`) that do not adapt to the dark theme. This creates a broken user experience when the platform is in dark mode. Standardizing these to use semantic theme variables will ensure full compatibility and visual consistency.

## What Changes

- Replace hardcoded background colors (`bg-white`) with `bg-background-surface` in admin pages and modals.
- Replace hardcoded border colors (`border-gray-200`) with `border-border-subtle`.
- Replace hardcoded text colors (`text-gray-700`, `text-gray-400`) with semantic counterparts (`text-text-secondary`, `text-text-muted`).
- Update hover states from `hover:bg-gray-50` to `hover:bg-background-subtle`.
- Audit and fix specific admin components: `AdminRequestsPage`, `WorkshopAdminPage`, `CentersScreen`, and associated modals.

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `web`: Ensure full theme compatibility across the administrative modules.

## Impact

- **Affected Code**: All `page.tsx` files in the admin-related routes and shared admin modals.
- **Systems**: Web Frontend UI consistency.
- **Dependencies**: None.
