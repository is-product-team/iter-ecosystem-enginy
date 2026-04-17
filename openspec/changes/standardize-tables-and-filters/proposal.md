## Why

The current web application has multiple pages where tables and filter panels are manually implemented using raw HTML tags and custom styles. This leads to visual inconsistencies, code duplication, and increased maintenance effort. By standardizing these patterns into reusable components, we ensure a unified "premium" aesthetic and simplify the development of new list-based views.

## What Changes

- **New Component: FilterPanel**: Create a standardized component for the filter area above data tables, ensuring consistent padding, layout, and styling for inputs, selects, and clear buttons.
- **DataTable Refinement**: Update the existing `DataTable` component to support more flexible styling (e.g., optional top border) and ensure it meets the requirements of all existing manual tables.
- **Table Replacement**: Replace manual `<table>` implementations in the following pages with the standardized `DataTable` component:
  - `apps/web/app/[locale]/requests/page.tsx`
  - `apps/web/app/[locale]/center/assignments/page.tsx`
  - `apps/web/components/Phase2Table.tsx`
- **Filter Standardization**: Update existing filter panels in `Workshops`, `Requests`, `Verifications`, and `Center Assignments` to use the new `FilterPanel` component.

## Capabilities

### New Capabilities
- `shared-ui-filterpanel`: Standardized container and layout for data filters.

### Modified Capabilities
- `shared-ui-datatable`: Refine the existing specification to support optional styling variants (e.g., nested tables without top borders).

## Impact

- **Web App**: Major refactoring of list-based pages (`/requests`, `/center/assignments`, `/workshops`, `/verifications`).
- **Components**: New `FilterPanel` component and updated `DataTable`.
- **Consistency**: Unified look and feel across all administrative and coordinator views.
