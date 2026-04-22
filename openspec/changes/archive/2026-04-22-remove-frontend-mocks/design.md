## Context

The current frontend implementations (both Web and Mobile) contain "professional fallbacks" and interceptors that return hardcoded data for specific users or during development. This masks integration gaps and prevents developers from seeing the actual state of the backend and database.

## Goals / Non-Goals

**Goals:**
- **Zero Mock Policy**: Ensure all components and services in the frontend use real backend data.
- **Fail Fast**: Allow the application to fail or show empty states when the backend is unreachable or data is missing, rather than showing fake success.
- **Service Alignment**: Align frontend data types with real Prisma/Postgres schemas from the backend.

**Non-Goals:**
- Modifying backend logic or database schemas.
- Updating `seed.js` data (this change only affects the consumption layer).
- Fixing the backend bugs discovered during this process (those will be handled in separate changes).

## Decisions

### 1. Interceptor Deconstruction
In `apps/mobile/services/api.ts`, the response interceptor currently contains logic to detect "known teachers" and return static objects.
- **Action**: Delete the entire `isDevelopment` check and user-based mock logic from the interceptor.
- **Rationale**: Parity between development and production environments is critical for reliable testing.

### 2. Service-Level Hardcode Removal
Constants like `MOCK_QUESTIONNAIRE_MODEL`, `MOCK_STUDENTS`, and `MOCK_WORKSHOP` are scattered in `api.ts`.
- **Action**: Delete these constants. Update any service functions that were explicitly returning them (or using them as fallbacks) to return empty arrays or throw errors.

### 3. Reports & Monitoring Refactor
The Web Admin Reports page uses hardcoded metrics for "Workshops Completed" and "Student Participation".
- **Action**: Update `apps/web/app/[locale]/reports/page.tsx` to use the `statsService` or show empty indicators.
- **Rationale**: It is better to show "No Data" than "Fake Data" in a management tool.

### 4. Data Flow Visualization

```
OLD FLOW (MOCKED):
Component -> Service -> Axios Interceptor (IF DEV & KNOWN_USER) -> Return MOCK -> Component

NEW FLOW (REAL):
Component -> Service -> Axios -> Backend -> Real Data -> Component
                                     └-> Error -> Error State -> Component
```

## Risks / Trade-offs

- **[Risk]**: The UI may look unpolished or "empty" if the database seed is not fully populated.
- **[Mitigation]**: Implement robust "Empty State" components and ensure the `seed.js` is updated in the project documentation as a prerequisite.
- **[Risk]**: Missing backend endpoints will cause 404/500 errors in the frontend.
- **[Mitigation]**: Use `try-catch` blocks with user-friendly toast notifications to inform that a service is "Coming Soon" or "Unavailable".
