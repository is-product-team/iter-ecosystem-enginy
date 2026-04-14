## Context

Current state has environment variables split across three files, resulting in out-of-sync configurations. Docker Compose is not correctly reading the root `.env`, and cross-service communication often defaults to `localhost`, which is inconsistent between local and containerized environments.

## Goals / Non-Goals

**Goals:**
- **Single Source of Truth**: Consolidate all environment variables into a single root `.env` file.
- **Fail-Fast Validation**: Ensure services do not start with incorrect or missing configuration.
- **Robust Networking**: Standardize DNS-based internal communication.
- **Clear Port Hierarchy**: Explicitly differentiate between host-exposed ports and container-internal ports.

**Non-Goals:**
- Implementing a full-blown secret management service (like HashiCorp Vault).
- Overhauling the production deployment infrastructure (keeping current GitHub Actions flow).

## Decisions

### 1. Unified Root `.env`
We will move all variables to `.env` at the root. Docker Compose services will point to this file using:
```yaml
env_file:
  - .env
```
This ensures that changing a port or credential in one place propagates to all containers.

### 2. Internal Service Networking
All communication within the Docker network will use service names defined in `docker-compose.yml`.
- `API` connects to DB using `DATABASE_URL=postgresql://user:pass@db:5432/db`
- `WEB` connects to API using `INTERNAL_API_URL=http://api:3000` (for Server Side Rendering) and `NEXT_PUBLIC_API_URL=http://localhost:3000` (for Browser calls).

### 3. Port Mapping Standard
We will use a clear naming convention in `.env`:
- `API_PORT_EXTERNAL`: The port you visit in your browser (e.g., 3000).
- `API_PORT_INTERNAL`: The port the app listens on inside the container (e.g., 3000).
Mapping in `docker-compose.yml`:
```yaml
ports:
  - "${API_PORT_EXTERNAL}:${API_PORT_INTERNAL}"
```

### 4. Zod-Based Validation (Enforcer)
We will create a shared utility using Zod to validate the environment.
```typescript
const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(10),
  PORT: z.coerce.number().default(3000),
  // ...
});
```
This validation will run at the entry point of both `api` and `web`.

## Risks / Trade-offs

- **Risk**: Deleting `apps/api/.env` and `apps/web/.env` might break local IDE toolings (like Prisma VSCode extension) if they don't look at the root.
- **Mitigation**: We can create an automated step in `package.json` to symlink the root `.env` to sub-apps for tool compatibility.
- **Trade-off**: Slightly higher complexity in `docker-compose.yml` but significantly lower maintenance burden.
