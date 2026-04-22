## MODIFIED Requirements

### Requirement: Frontend API Error Handling
The frontend (web and mobile) SHALL NOT mask API failures with local mock data or "professional fallbacks". All 4xx and 5xx errors from the backend MUST be propagated to the UI as either error states or user-friendly notifications.

#### Scenario: Backend connection failure
- **WHEN** the backend is unreachable (e.g., Network Error or 404)
- **THEN** the frontend SHALL show a "Service Unavailable" message or toast instead of returning hardcoded success data.

### Requirement: Development Data Parity
The application SHALL NOT use user-specific logic (e.g., email-based interceptors) to return different data payloads in development unless explicitly part of the business requirements.

#### Scenario: Login as test user in dev
- **WHEN** a user (e.g., Laura Martinez) logs in during development
- **THEN** the application SHALL fetch real data from the database instead of intercepting the response with local objects.
