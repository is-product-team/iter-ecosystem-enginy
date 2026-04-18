## Why

The current `DataTable` and `FilterPanel` are designed for a "Premium" spaced-out aesthetic which is suitable for dashboard summaries but inefficient for heavy data management. To transition the web application toward a more data-centric, "serious" management tool (similar to NocoDB or Airtable), we need a high-density grid interface that maximizes visibility and structural clarity.

## What Changes

- **Visual Architecture**: Transition the global `DataTable` from a spaced-out layout to a compact "Raw Grid" aesthetic.
- **Global Stylization**: Remove all decorative backgrounds (header backgrounds, alternating row colors, button pills) in favor of minimalist borders and typography.
- **Enhanced Productivity**: Implement column resizing with local persistence and a sticky index column to maintain context in large datasets.
- **Consistent UX**: Redesign the `FilterPanel` to match the table's "Raw" look, ensuring a seamless vertical flow from filters to data.

## Capabilities

### New Capabilities
- **Column Resizing**: Users can now adjust column widths to fit their needs, with state saved in `localStorage`.

### Modified Capabilities
- `shared-ui-datatable`: The core specification is being updated to prioritize high-density data representation over white-space aesthetics.

## Impact

- **Web Application**: Global impact. Every page using `DataTable` (Centers, Requests, Workshops, etc.) will adopt the new look.
- **User Experience**: Drastic increase in data rows and columns visible per screen.
- **Design System**: Simplification of the design system components by removing background-related variables from the table context.

## Related Specs
- [shared-ui-datatable](file:///Users/kore/Documents/Code/Projects/iter-ecosystem-enginy/openspec/specs/shared-ui-datatable/spec.md)
