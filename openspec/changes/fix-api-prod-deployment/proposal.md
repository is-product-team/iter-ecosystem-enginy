## Why

The Backend API is currently failing in production with an `unhealthy` status and a crash loop. The primary cause is a module resolution error (`ERR_MODULE_NOT_FOUND`) when attempting to load the `shared` package, combined with a rigid environment variable validation that fails due to incorrect path resolution in the production container structure.

## What Changes

- **ESM Compatibility**: Update `shared` package imports to include `.js` extensions as required by Node.js ESM in production.
- **Docker Build Optimization**: Refactor the `runner-api` stage in the `Dockerfile` to correctly copy and resolve compiled files for both the API and the `shared` package.
- **Environment Robustness**: Update the environment configuration to prioritize existing system environment variables over physical `.env` files in production, and fix relative path resolution for the fallback `.env` loader.
- **Infrastructure Completeness**: Add the missing `ollama` service to the production Docker Compose configuration to ensure full system functionality.

## Capabilities

### New Capabilities
- `deployment-stability`: Ensures the API can start and pass health checks in a containerized production environment by correctly resolving compiled dependencies and environment variables.

### Modified Capabilities
- `infra`: Infrastructure requirements now include explicit support for ESM module resolution and correct cross-package compiled file mapping in the production image.

## Impact

- **Affected Code**: `apps/api/src/config/env.ts`, `shared/index.ts`, `Dockerfile`, `docker-compose.prod.yml`.
- **Dependencies**: Impacts how `shared` is consumed by `api` and `web` in production.
- **Systems**: Directly affects the stability of the production deployment pipeline and the health of the Backend service.
