## Why

The recent `DataTable` redesign requires further visual refinements to achieve a more "premium" and clean look, as requested by the user. Specifically, certain decorative backgrounds are distracting, and the general alignment needs to be more consistent (centered) to improve scannability in data-heavy screens like the Requests panel.

## What Changes

### 1. DataTable Component
- **Index Column (#)**: Remove the `bg-background-subtle/5` background from the index cell.
- **Centering**: Update the default column alignment to `center` so that headers and content align perfectly by default.

### 2. Requests Page (Status UI)
- **Status Indicators**:
    - Replace the dot/border indicator with clean SVG icons (CheckCircle for Approved, XCircle for Rejected, Clock for Pending).
    - Remove all background and border colors from the status badge, keeping only the icon and the colored text.
- **Column Harmony**: Ensure all columns in the Requests table use the new centered alignment.

## Capabilities

- `ui-components-datatable`: Clean grid aesthetics.

## Impact

- **Visual Consistency**: A more "Notion-like" clean grid.
- **Clarity**: Statuses are easier to read with intuitive icons instead of just color dots.
