## Why

After the first phase of table unification, several high-traffic pages still use manual HTML table implementations. This results in visual debt, duplicated logic for pagination and filters, and a fragmented user experience. This final phase aims to achieve 100% UI consistency by migrating all remaining tables to the unified `DataTable` component.

## What Changes

- **Refactor CRUD Tables**: Migrate Students, Teachers, and Centers management pages to use the `DataTable` component.
- **Refactor Management Tables**: Migrate Assignments and Document Verifications pages.
- **Refactor Interactive Tables**: Migrate the Attendance/Check-list table, demonstrating `DataTable` support for internal stateful elements (inputs/buttons).
- **Component Standardization**: Update `Phase2Table` to inherit the "Premium" styles from the unified component.
- **Code Cleanup**: Remove legacy manual table implementations and redundant pagination wrappers in the affected pages.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `shared-ui-datatable`: Extend requirements to explicitly support stateful interactive elements within cells (e.g., attendance buttons).
- `web`: Mandate the use of `DataTable` for 100% of tabular data views in the web application.

## Impact

- **Frontend**: Significant reduction in code volume in `apps/web/app/[locale]/center/students/page.tsx`, `apps/web/app/[locale]/center/teachers/page.tsx`, `apps/web/app/[locale]/centers/page.tsx`, etc.
- **User Experience**: Perfectly consistent visuals and loading/pagination behavior across the entire dashboard.
- **Maintability**: Single point of failure/improvement for all table layouts.
