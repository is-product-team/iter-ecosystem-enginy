## 1. Backend Module Resolution Fixes

- [x] 1.1 Update `shared/index.ts` internal imports to include `.js` extensions.
- [x] 1.2 Verify all exports in `shared/package.json` are still compatible.

## 2. Environment Configuration Resiliency

- [x] 2.1 Refactor `apps/api/src/config/env.ts` to prioritize system environment variables.
- [x] 2.2 Fix the fallback `dotenv` path in `env.ts` to handle different container runtime paths.
- [x] 2.3 Ensure environment validation does not exit the process if required variables are already present in `process.env`.

## 3. Infrastructure and Docker Adjustments

- [x] 3.1 Update the `runner-api` stage in the root `Dockerfile` to copy the correct compiled `dist` structure.
- [x] 3.2 Adjust the `CMD` in `Dockerfile` to match the compiled entry point: `apps/api/dist/apps/api/src/index.js`.
- [x] 3.3 Add the `ollama` service to `docker-compose.prod.yml`.
- [x] 3.4 Add `OLLAMA_HOST` and `AI_MODEL_VISION` environment variables to `api` in `docker-compose.prod.yml`.

## 4. Verification and Deployment Readiness

- [x] 4.1 Run a local production-like build to verify the `dist` structure.
- [x] 4.2 Verify health check command in `docker-compose.prod.yml` points to the correct endpoint and port.

