# Tasks: Automate DB Seeding (Docker Setup)

## Infra

- [ ] Modify `docker-compose.yml`:
    - [ ] Update the `setup` service command to include `npx turbo db:seed --filter=@iter/api` after the migration push.
- [ ] Verify Docker startup sequence:
    - [ ] Run `docker compose up --build setup` to ensure the seed is executed correctly during initialization.

## Backend

- [ ] Audit `apps/api/prisma/seed.ts` for idempotency:
    - [ ] Ensure all `upsert` logic for Roles, Sectores, and initial Admin User is bulletproof.
    - [ ] Add a confirmation message at the end of the script to signal successful completion.

## Verification

- [ ] Clear existing data manually.
- [ ] Run the automated setup.
- [ ] Verify that `admin@admin.com` can log in immediately after setup completes without manual intervention.
