## Why

The current environment setup with Docker is "fragile" during rebuilds. Using `prisma db push --accept-data-loss` in the `setup` service clears the database content every time the schema is touched or the volumes are recreated. Since the `seed` command is not automatically executed, the system starts with no users and no centers, preventing login even with correct credentials.

Additionally, running seed commands from the project root fails because the Prisma schema is localized to the `apps/api` workspace.

## What Changes

- **Automated Docker Seeding**: Add the seed execution to the `setup` service in `docker-compose.yml`.
- **Root Seeding Alias**: Ensure that the root `db:seed` command is properly mapped to reach the API workspace's seed script.
- **Idempotency**: Ensure `seed.ts` can be run multiple times safely (using `upsert`).

## Capabilities

- `infra-docker-setup`: Add database seeding as a standard post-migration step.

## Impact

- **Developers**: No longer need to manually seed after a `docker compose build`.
- **Reliability**: Guarantees that the base `admin@admin.com` account is always present.
