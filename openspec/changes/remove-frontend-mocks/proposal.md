## Why

The current frontend (web and mobile) relies on hardcoded mocks and interceptors that bypass real backend data, making it impossible to verify end-to-end integration and the correctness of database seeding. Removing these "fake" data layers is essential to ensure that the application reflects the true state of the system and to surface any missing backend functionality before moving to production.

## What Changes

- **Axios Interceptor Removal**: Remove the response interceptors in `apps/mobile/services/api.ts` that return mock data for "known teachers" (e.g., Laura Martinez).
- **Service Cleanup**: Delete hardcoded mock constants (`MOCK_QUESTIONNAIRE_MODEL`, `MOCK_STUDENTS`, `MOCK_WORKSHOP`) from mobile and web services.
- **Report Connection**: Replace hardcoded statistics and "Top Rated" lists in the Admin Reports page (`apps/web/app/[locale]/reports/page.tsx`) with real service calls.
- **KPI Synchronization**: Connect the incidents KPI in the Monitoring dashboard to a backend service instead of a hardcoded zero value.
- **UI Component Audit**: Replace static "dummy" data arrays in UI components (like `ResourcesWidget`) with dynamic data where applicable or empty states if no data exists.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `api`: Requirements for error handling and fallbacks are being tightened to prevent "silent" failures masked by mocks.
- `questionnaires`: Ensuring the frontend consumption strictly follows the backend model without local overrides.

## Impact

- **Mobile App**: Affects `apps/mobile/services/api.ts` and questionnaire screens. Users will no longer see fallback data if the backend is down.
- **Web Admin**: Affects reports and monitoring dashboards. Statistics will now reflect real database values.
- **Integration**: Surfaces any gaps between the frontend expectations and the current backend/database state (e.g., missing incident endpoints).
