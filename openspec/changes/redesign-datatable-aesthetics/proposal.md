## Why

The current `DataTable` and `FilterPanel` components, while functional, lack the high-fidelity aesthetic seen in modern data-heavy applications (like Notion or premium administrative grids). Specifically, they missing vertical borders, integrated filtering layouts, and specific header iconography that enhance readability and professional feel.

## What Changes

### DataTable Redesign
- **Vertical Borders**: Add subtle vertical separators between columns to clearly define data boundaries.
- **Premium Header**:
    - Solid background (`bg-background-subtle`) in the `thead`.
    - Horizontal and vertical borders for a "grid" look.
    - Integration of icons (search, filter, sort) in the column headers to match the reference images.
- **Compact Layout**: Adjust padding to `px-4 py-3` for a denser, more professional presentation of information.
- **Index Column**: Provide better support for an index column (`#`) as seen in the mockup.

### FilterPanel Integration
- **Aesthetic Alignment**: Restyle the `FilterPanel` to match the `DataTable` exactly (same borders, background, and padding).
- **Integrated Look**: Modify the layout so the `FilterPanel` feels like it has been "slotted" into the table's header area rather than being a separate, floating block.
- **Enhanced Icons**: Add relevant Lucide icons to filter labels and actions.

## Capabilities

### Modified Capabilities
- `shared-ui-datatable`: Update visual schemas to include grid borders and advanced header styling.
- `shared-ui-filterpanel`: Align visuals with the new table standard.

## Impact

- **Components**: `apps/web/components/ui/DataTable.tsx` and `apps/web/components/ui/FilterPanel.tsx`.
- **User Experience**: Improved data scannability and a more "expensive", cohesive feel for all administrative views.
