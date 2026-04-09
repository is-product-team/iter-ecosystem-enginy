# Proposal: Unify Environment and Ports Management

## Problem

The current environment configuration is fragmented across multiple `.env` files in the root, `apps/api`, and `apps/web`. This leads to several critical issues:
- **Synchronization Frustration**: Updating a variable like a database password or a port frequently results in one service being out of sync, causing "Connection Refused" or authentication errors.
- **Port Collisions**: Ports are defined in multiple places, often with hardcoded defaults that clash during local development or Docker builds.
- **Fragile Networking**: Services often rely on `localhost` for cross-service communication, which fails inside Docker networks if not handled through service names.
- **Hidden Complexity**: Hardcoded environment variables and lack of validation make it difficult to detect missing secrets until the application crashes at runtime.

## What Changes

We will transition to a "Source of Truth" architecture:
1.  **Unified Root Configuration**: All environment variables for the entire monorepo will live in a single `.env` file at the root. Docker Compose and sub-apps will read from this source.
2.  **Standardized Port Registry**: Categorize all ports into `INTERNAL` (within Docker) and `EXTERNAL` (host access) to ensure clarity.
3.  **Internal Service Discovery**: Mandate the use of Docker service names (`db`, `api`) for internal communication, eliminating the `localhost` trap.
4.  **Runtime Validation**: Implement a centralized validation utility (using Zod) that checks the existence and format of required variables when any service starts.
5.  **Hardcode Cleanup**: Audit and replace hardcoded configuration values with environment-driven variables.

## Capabilities

### New Capabilities
- `environment-management`: Centralized registry for all platform configurations, secrets, and environment-specific settings.
- `internal-networking`: DNS-aware service communication configuration that automatically adapts between local and Docker environments.

## Impact

- **Affected Code**: `apps/api`, `apps/web`, `docker-compose.yml`, CI/CD workflows.
- **APIs**: No breaking changes to public APIs, but internal service URIs will be updated.
- **Dependencies**: Adding `zod` to a shared configuration package for validation.
- **Systems**: Simplifies local development setup and GitHub Secrets management.
