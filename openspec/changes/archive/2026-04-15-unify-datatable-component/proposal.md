## Why

The Iter Ecosystem currently uses fragmented table implementations across the web application (e.g., in Admin Requests, Workshop Management, Center Assignments). This leads to visual inconsistencies, duplicated UI logic for pagination and filtering, and increased maintenance effort. A unified, accessible, and high-performance `DataTable` component is needed to standardize the user experience and simplify frontend development.

## What Changes

- **New Shared Component**: Create a reusable `DataTable` component in `apps/web/components/ui/` that follows the "Premium" design pattern identified in `globals.css`.
- **Logic Centralization**: Encapsulate common table patterns such as pagination, sorting, search-filtering, and loading states within the component.
- **Refactor Workshop Requests**: Migrate both Admin (`/requests`) and Center (`/center/requests`) request tables to use the new `DataTable` component.
- **Refactor Core Tables**: Gradually migrate Workshop Management and Center Management tables to the new component.

## Capabilities

### New Capabilities
- `shared-ui-datatable`: A reusable, accessible, and theme-aware table component with integrated pagination, search, and loading states.

### Modified Capabilities
- `web`: Standardize the UI patterns for all data-heavy views to use the new common component.

## Impact

- **Frontend**: Significant refactoring of `apps/web/app/[locale]/requests/page.tsx`, `apps/web/app/[locale]/center/requests/page.tsx`, and `apps/web/app/[locale]/workshops/page.tsx`.
- **Design System**: New entry in the common UI component library for consistent "premium" look-and-feel.
- **Performance**: Improved rendering and interaction patterns for large datasets.
