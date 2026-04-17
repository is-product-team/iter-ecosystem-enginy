## Why

The current requests table in the center admin view has some visual inconsistencies and layout choices that could be improved for better clarity and aesthetic balance. Specifically, the "Actions" column is right-aligned while the "Status" column is centered, and the action buttons use text which takes up significant space. Additionally, the orange color for "Pending" status text is inconsistent with other status labels that use standard black text with colored indicators.

## What Changes

- **Centered Actions Column**: Align the actions column to the center to improve visual symmetry.
- **Icon-based Action Buttons**: Replace the "Approve" and "Reject" text buttons with intuitive icons (Check and X/Trash) to save horizontal space and provide a cleaner look.
- **Standardized "Pending" Status**: Update the "Pending" status label to use standard primary text color (black) while keeping a subtle orange indicator (icon or background).

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `shared-ui-datatable`: The requirements for cell alignment and interactive elements are refined to prioritize icon-based actions in specific admin views.

## Impact

- **Web App**: Refactoring of the `AdminRequestsPage` (`/requests`) to use the new layout and component patterns.
- **Visual Consistency**: Improved alignment and color usage across admin tables.
