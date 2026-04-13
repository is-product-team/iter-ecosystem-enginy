# Tasks: Redesign Verifications Dashboard

Implementation steps to transition from the card-based layout to a high-density matrix.

## Phase 1: Data Preparation & Layout Refactor
- [ ] Create a "flat list" transformer function in `verifications/page.tsx` that extracts all enrollments into a single array.
- [ ] Implement the base `VerificationTable` component with fixed-width headers and high-density rows.
- [ ] Replace the current `assignments.map` logic with the new `enrollmentsFlat.map` logic.

## Phase 2: High-Density UI Components
- [ ] Design and implement the `StatusBadge` component for the 3 document types (compact version).
- [ ] Create the `VerificationSidePanel` (Slide-over component) using a Portal for overlaying the dashboard.
- [ ] Implement document switching inside the side panel (Agreement -> Mobility -> Rights).
- [ ] Connect the "Approve/Reject" logic from the existing `handleValidateDocument` to the new panel.

## Phase 3: Filters & Navigation
- [ ] Implement the `VerificationFilterBar` with text search and center-based filtering.
- [ ] Add the "Bulk Selection" mechanism to the and checkboxes to the table rows.
- [ ] Refactor the existing "Bulk Action Bar" to match the new high-density aesthetic.

## Phase 4: Polish & Performance
- [ ] Ensure the 0px border-radius is strictly enforced.
- [ ] Optimize the PDF viewer loading state inside the side panel.
- [ ] Add basic keyboard shortcuts (Esc, Arrows).
- [ ] Verify dark mode consistency for all new elements.
