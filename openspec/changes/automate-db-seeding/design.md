## Implementation Strategy

### 1. Docker Setup Service
Modify the `setup` command in `docker-compose.yml` to include the seed execution as a final step of the chain. This ensures that every time the containers are built or reset, the minimum required data is inserted.

```sh
# Current:
sh -c "npm install && npx turbo db:generate --filter=@iter/api && npx prisma db push --schema=apps/api/prisma/schema.prisma --accept-data-loss"

# Proposed:
sh -c "npm install && npx turbo db:generate --filter=@iter/api && npx prisma db push --schema=apps/api/prisma/schema.prisma --accept-data-loss && npx turbo db:seed --filter=@iter/api"
```

### 2. Seeding Idempotency
Verify and enhance `apps/api/prisma/seed.ts` to ensure that running it multiple times against an existing database does not cause unique constraint violations on roles, sectors, and the main administrator. This is crucial if the `setup` service is rerun without a database reset.

### 3. Root Level Seeding Alias
We will stick to the Turborepo standard `npm run db:seed` from the root, which correctly filters the workspace and executes the seed with the right context.

## Logic Flow

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Docker  │───▶│  Setup   │───▶│  Prisma  │───▶│  Seed    │
│  Compose │    │  (npm i) │    │  Push    │    │  (Users) │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
```
