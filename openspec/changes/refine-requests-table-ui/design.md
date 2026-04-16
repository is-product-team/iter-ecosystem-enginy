## Context

The `AdminRequestsPage` uses the `DataTable` component to display requests grouped by workshop. Currently, the actions (Approve/Reject) are rendered as text-based buttons in a right-aligned column. This design is being refined to improve visual balance and clarify status indications.

## Goals / Non-Goals

**Goals:**
- Center the Actions column.
- Use iconography for primary row actions.
- Standardize the "Pending" status text color.

**Non-Goals:**
- Changing the functional logic of approval or rejection.
- Modifying the mobile view.

## Decisions

### 1. Column Alignment
The `align: 'center'` property will be applied to the `tc('actions')` column in the `AdminRequestsPage`. This matches the alignment of the "Status" column, creating a more symmetrical layout.

### 2. Iconography for Actions
Instead of `<button>Approve</button>`, we will use a circular or square icon button:
- **Approve**: `Check` icon (`M5 13l4 4L19 7`) in a green container or as a green-colored icon.
- **Reject**: `X` icon (`M6 18L18 6M6 6l12 12`) in a red container or as a red-colored icon.

**Rationale**: Icons are language-agnostic and more compact, allowing the table to breathe better.

### 3. Status Label Refinement
The `REQUEST_STATUSES.PENDING` label will be updated:
- **Text Color**: Change from `text-orange-600` to `text-text-primary`.
- **Indicator**: Maintain the orange dot or icon to preserve the semantic meaning of "Pending".

## Risks / Trade-offs

- **[Risk] Affordance** → Some users might not immediately recognize the icons. Mitigation: Add `title` or `aria-label` attributes to the buttons for tooltips and accessibility.
- **[Trade-off] Color Semantics** → Changing "Pending" text to black might make it less prominent. Mitigation: Ensure the background or dot remains orange to maintain urgency.
