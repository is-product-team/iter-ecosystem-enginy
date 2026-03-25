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
