# Proposal: Improve Workshop Request UX

## Goal
Optimize the workshop request process for coordinators by improving information visibility and task flow efficiency.

## Background
Coordinators currently face several friction points when requesting workshops:
- Key information (duration, capacity) is not visible in the main catalog.
- The sidebar form layout consumes significant screen real estate and feels disconnected from the selected row.
- Table headers and columns are misaligned due to a rendering bug.
- Theme inconsistencies make the interface difficult to use in dark mode.

## Proposed Solution
1. **Catalog Optimization**:
   - Fix table alignment.
   - Surface "Duration" and "Max Students" directly in the catalog row.
2. **Contextual Form Layout**:
   - Replace the fixed sidebar with an **Expandable Row**.
   - When a workshop is selected, the form opens directly beneath it, showing the full workshop description and request fields.
3. **Thematic Refinement**:
   - Transition all component styles to use semantic CSS variables (`--text-primary`, `--bg-surface`, etc.) to ensure seamless switching between light and dark modes.

## Links
- [System Overview](../../../docs/architecture/system-overview.md)
- [Workshop Data Model](../../../docs/architecture/data-model.md)
