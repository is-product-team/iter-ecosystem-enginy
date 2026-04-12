# Tasks: Professional Build & Deploy Pipeline

## Infrastructure (GitHub Actions & Docker)
- [ ] Create `.github/workflows/deploy-optimized.yml`.
    - [ ] Configure build job for `api` and `web`.
    - [ ] Configure GHCR login and image push.
    - [ ] Configure deployment job on `self-hosted` runner.
- [ ] Update `docker-compose.prod.yml` to use GHCR images.
- [ ] Update `Dockerfile` to optimize production stages.

## Database (Prisma)
- [ ] Generate baseline migration: `npx prisma migrate dev --name init`.
- [ ] Update deployment script to use `npx prisma migrate deploy`.

## Implementation & Verification
- [ ] Run the `optimized` workflow manually to verify image creation.
- [ ] Verify that the server pulls images correctly.
- [ ] check health-checks performance and downtime during swap.
