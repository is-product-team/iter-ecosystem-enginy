## ADDED Requirements

### Requirement: Unified Source of Truth
The system must maintain all configuration and secrets in a single root `.env` file that is shared among all orchestrations (Docker Compose) and service runtimes.

#### Scenario: Update Port Configuration
- **WHEN** the `API_PORT_EXTERNAL` is modified in the root `.env` file.
- **THEN** both the Docker Compose port mapping and the Web application's target API URL must reflect this change without manual intervention in other files.

### Requirement: Environment Validation
All services must validate their required environment variables at the application entry point before initializing any external connections (DB, Cache, etc.).

#### Scenario: Start with Missing Required Variable
- **WHEN** the API service starts without a defined `JWT_SECRET`.
- **THEN** the application must terminate immediately with an Exit Code 1 and log a human-readable message identifying the missing variable.

### Requirement: Deterministic Networking
Internal cross-service communication must be hardcoded to relative DNS service names, while external communication remains configurable via ports.

#### Scenario: Server-Side Rendering API Call
- **WHEN** the Web application performs a server-side data fetch from the API inside a Docker network.
- **THEN** it must use the internal DNS name (e.g., `http://api:3000`) instead of `localhost`.
