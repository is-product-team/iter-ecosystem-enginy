## Why

The application currently has inconsistent page layouts. Some pages like `Profile` use a narrow `max-w-4xl` container, while others like `Reports` or `Stats` use the full width of the `DashboardLayout`. This leads to a fragmented user experience where elements shift position across different sections.

## What Changes

- Standardize all web application pages to use the full width provided by `DashboardLayout`'s `container-responsive`.
- Remove manual `max-w-*` and `mx-auto` centering from individual page components that conflict with the global layout.
- Unify the vertical spacing and padding patterns across all top-level page wrappers.
- Ensure all pages use `w-full pb-20` as the base container class within `DashboardLayout`.

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `web`: Standardize the responsive design pattern for all internal pages.

## Impact

- **Affected Code**: All `page.tsx` files in `apps/web/app/[locale]/`.
- **Systems**: Web Frontend UI consistency.
- **Dependencies**: None.
