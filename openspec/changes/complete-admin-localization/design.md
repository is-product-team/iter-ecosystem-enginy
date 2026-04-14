# Design: Complete Admin Localization

## Architecture & Approach
We will continue to heavily leverage `next-intl` and stick to the established namespace conventions:

1. **New Keys in Dictionaries**: We need to define new nested objects or append to existing ones (like `Forms`, `Common`, or view-specific namespaces) within `en.json` and `ca.json`.
2. **Component Refactoring**: In the target `tsx` components, we will wrap string literals and conditionals using the `useTranslations` hook.

## Dictionary Target Namespaces
* `CreateWorkshopModal`: Use the recently restored `Forms` namespace for field names and modal-specific text.
* `Pagination` / `NextEventsWidget`: Inject into the existing `Common` namespace.
* `Center Dashboard Routes`: Extend the `Dashboards.center` or individual page namespaces (e.g., `AssignmentsPage`, `StudentsPage`).

## Key Updates & Strategy
- Ensure text extraction properly handles dynamic interpolations (e.g., `Showing {currentItemsCount} of {totalItems} {itemName}`).
- Avoid text duplication. Centralize repetitive headers like "Main Teacher" into an appropriate common area if reused, otherwise scope it to the page.

## Risks & Edge Cases
- **Dynamic Variable Safety**: React interpolation syntax `{amount}` must strictly match the dictionary definition.
- **Cache invalidation**: The Next.js dev server container must be completely restarted or triggered to fully ingest new JSON structures, avoiding false-positive "MISSING_MESSAGE" errors.
