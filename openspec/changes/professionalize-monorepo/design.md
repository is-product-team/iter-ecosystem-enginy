## Context

The project has transitioned to a "Lean Monorepo" with a shared root directory, but it still suffers from "local hardcoding" of domain logic in the components and mixed language artifacts (Catalan/Spanish/English). This design focuses on consolidating every domain-specific string into the shared layer and standardizing all user-facing interactions to Catalan.

## Goals / Non-Goals

**Goals:**
- Centralize all `RequestStatus` and `AssignmentStatus` values in `@iter/shared`.
- Ensure `ChartComponents` in the Web app use these constants instead of hardcoded strings.
- Standardize all background service notifications and API error messages to Catalan.
- Eliminate typos and redundant logic in `ReminderService` and `PeticioController`.

**Non-Goals:**
- No database schema changes (PostgreSQL values remain as-is).
- No changes to authentication or authorization roles.
- No new functional capabilities.

## Decisions

1. **Source of Truth for Statuses**: Use the `REQUEST_STATUSES` and `ASSIGNMENT_STATUSES` constants in `/shared/index.ts` for all comparisons and assignments.
2. **Linguistic Standard**: **Catalan** is the primary language for all user-facing strings. Spanish and English will be removed from notifications and error responses.
3. **Chart Refactoring**: The `categories` array in `ChartComponents.tsx` will be derived from `REQUEST_STATUSES` keys or values to ensure the UI automatically reflects the domain model.

## Risks / Trade-offs

- **Risk**: Renaming keys in notifications might affect external monitoring or automated parsing if any exists (none identified).
- **Trade-off**: Moving everything to `/shared/index.ts` is simple now but may require further sub-division into `/shared/constants/` later if the file grows significantly.
