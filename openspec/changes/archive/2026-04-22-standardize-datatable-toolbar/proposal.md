## Why

The current administrative interface uses fragmented and inconsistent filter implementations across different pages, leading to visual debt and a lack of a cohesive "premium" feel. A standardized, minimalist, and integrated toolbar is needed to unify the user experience and provide a high-fidelity, "sharp" aesthetic that aligns with the existing high-quality `DataTable` component.

## What Changes

- **New `DataTableToolbar` Component**: A unified UI component that combines table titles, primary actions, and a grid-based filter system.
- **Integrated Filter Grid**: A sharp-edged grid layout for search inputs and select filters that sits flush against the `DataTable`, sharing the same border system.
- **Minimalist Aesthetic**: Strict adherence to a "no rounded corners, no shadows" design language, using subtle background colors (`bg-background-subtle`) and fine borders (`border-border-subtle`).
- **Responsive "Cell" System**: Filters that adapt from a single row on desktop to a multi-column grid on tablet and a full stack on mobile, maintaining the grid integrity.
- **Standardized Implementation**: Replacement of manual filter panels in `Requests`, `Students`, `Centers`, and `Workshops` pages with the new component.

## Capabilities

### New Capabilities
- `shared-ui-datatable-toolbar`: Defines the requirements for an integrated, minimalist toolbar system for data grids, including title management, primary actions, and integrated filtering.

### Modified Capabilities
- `shared-ui-datatable`: Updated to ensure perfect visual alignment and border-sharing with the new toolbar component.

## Impact

- **UI Components**: `apps/web/components/ui/DataTableToolbar.tsx` (new), `apps/web/components/ui/DataTable.tsx` (modified), `apps/web/components/ui/FilterPanel.tsx` (deprecated/updated).
- **Admin/Center Pages**: All pages utilizing `DataTable` for entity management (Students, Requests, Workshops, Centers).
- **Design System**: Formalizes the "Sharp" UI pattern for administrative controls.
