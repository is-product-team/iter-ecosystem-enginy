## Why

The current `DataTable` component is functional but lacks a "Premium Minimalist" aesthetic that aligns with the project's high-fidelity design standards. This change aims to elevate the user experience through refined typography, better visual hierarchy, and interactive feedback, making the data-intensive parts of the application feel more professional and polished.

## What Changes

- **Header Refinement**: Add a `2px` top border in `var(--consorci-darkBlue)` to the table container. Update header typography to use `text-[10px]`, `tracking-[0.15em]`, and refined weights.
- **Interactive Row States**: Implement a high-fidelity hover state including a lateral indicator (`2px` border-left) and subtle background transition.
- **Zebra Striping**: Introduce a very subtle zebra pattern (`bg-background-subtle/5` on even rows) to improve horizontal scanability.
- **States Standardization**: 
    - **Empty State**: Replace plain text with a centered container featuring a minimalist icon and a "tracking-widest" message.
    - **Loading State**: Implement a row-based skeleton loader that preserves the table structure during data fetching.
- **Cell Hierarchy**: Standardize typography within cells to distinguish between primary information (`text-[13px]`) and secondary/metadata (`text-[10px] text-muted`).

## Capabilities

### Modified Capabilities
- `shared-ui-datatable`: Update the visual requirements to include specific tokens for premium styling (accent borders, lateral indicators, and skeleton states).

## Impact

- **Components**: `apps/web/components/ui/DataTable.tsx` will be the primary target for implementation.
- **Global Styles**: Potential minor updates to `apps/web/app/globals.css` if new utility classes are needed.
- **Pages**: All views currently utilizing `DataTable` (e.g., Centers, Workshops, Phases) will automatically benefit from these enhancements.
