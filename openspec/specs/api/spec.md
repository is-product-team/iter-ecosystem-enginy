# Specification: API Backend

The backend is built with Node.js 22 and Express, using Prisma ORM to interact with a PostgreSQL database.

## Structure

- **Routes (`/src/routes`)**: Define the API endpoints.
- **Controllers (`/src/controllers`)**: Handle incoming requests and orchestrate service calls.
- **Services (`/src/services`)**: Contain business logic and domain rules.
- **Repositories (`/src/repositories`)**: Direct data access layer (optional, often using Prisma directly in services).
- **Middlewares (`/src/middlewares`)**: Authentication, logging, and validation logic.

## Key APIs

- **Auth**: JWT-based authentication for users and administrators.
- **Assignments**: Management of workshop schedules and groups.
- **Enrollment**: Student registration and document validation.
- **Attendance**: Real-time tracking of student presence.
- **Telemetry**: High-frequency GPS data processing.
- **Security**: Endpoint-level rate limiting (5 req/15 min for auth, 100 req/15 min general).

## Requirements

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
