# Proposal: Redesign Verifications Dashboard (Professional High-Density)

The current student document verification UI in the Admin dashboard is visually cluttered and does not scale for handling hundreds of students. It uses a card-based layout inside table rows that consumes excessive vertical space and creates cognitive fatigue.

## Problem

1.  **Low Information Density**: Each student takes up too much space with large buttons and redundant labels.
2.  **Inflexible Hierarchy**: The view is locked to Assignments, making it difficult to perform global student-level searches or status-based filtering.
3.  **UI "Noise"**: The use of multiple colors and large buttons for simple status indicators (Validated vs. Pending) makes the interface feel less professional and more chaotic.

## Goal

-   **Scale to Hundreds**: Transition to a compact, data-matrix-style list where 20-30 students can be seen on a single screen without scrolling.
-   **Professional Logic**: Use subtle status indicators (color-coded dots/pills) and high-quality iconography instead of generic buttons.
-   **Efficiency**: Implement a Slide-over (Side Panel) for document viewing, allowing the user to verify one student after another without leaving the main list.
-   **Bulk Operations**: Enable easy selection and one-click approval for auto-validated documents.

## Scope

-   **Frontend**: Complete rewrite of `apps/web/app/[locale]/verifications/page.tsx`.
-   **Components**: Introduction of a `VerificationsDataGrid` and `VerificationDetailSlideOver`.
-   **Logic**: Flat mapping of assignment-students into a searchable global registry.
-   **Internationalization**: Update translation keys to fit the new, more professional terminology.

## Design Principles

-   **Sharp Minimalist**: 0px border-radius (respecting existing institutional styles).
-   **Achromatic Base**: Deep dark blues and neutral grises, using vibrant success/error colors only for critical status feedback.
-   **Action-Oriented**: Prioritize the "Approval" and "Report Problem" actions as primary workflows.
