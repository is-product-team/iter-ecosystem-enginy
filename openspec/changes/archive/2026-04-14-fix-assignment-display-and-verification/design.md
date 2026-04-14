# Design: Data and Display Synchronization

## Architecture

We will implement a data transformation layer in the backend to ensure compatibility between how data is stored (JSON fields) and how it's consumed by the frontend (top-level properties).

## Components

### Backend: `assignment.controller.ts`
-   **Include `sessions`**: Ensure the Prisma query for all assignments includes the sessions relation.
-   **Include `request`**: Ensure the Prisma query includes the related request to access `preferredStartDate`.
-   **Data Transformation**: Implement a `mapAssignmentForFrontend` function that:
    -   Flattens `enrollment.docsStatus` so `pedagogicalAgreementUrl` etc. are available at the enrollment root.
    -   Populates `startDate` and `endDate` from the `request` if `sessions` are empty.

### Frontend: `verifications/page.tsx`
-   **Date Fallback**: Use `assig.request.preferredStartDate` if `assig.startDate` is missing.

## Risks & Considerations
-   **Deep Cloning**: Ensure the transformation doesn't mutate Prisma objects in a way that affects other parts of the system.
-   **Type Safety**: Update TypeScript interfaces if necessary (though the `any` casting in the controller already bypasses some checks).
