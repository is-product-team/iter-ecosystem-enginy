# Proposal: Professional Build & Deploy Pipeline

## Goal
Optimize the build and deployment process to prevent server freezes, ensure database safety (idempotency and safe migrations), and follow industry standards for monorepos.

## Context
Iter Ecosystem is currently building Docker images directly on the production VPS. This process is resource-intensive and leads to system instability during deployment. Additionally, database changes are applied using `db push`, which is unsafe for production environments as it can lead to accidental data loss.

## Proposed Strategy

### CI/CD Transformation
- **Externalized Build**: Use GitHub Actions to build Docker images on GitHub-hosted runners.
- **Image Registry**: Push pre-built images to GitHub Container Registry (GHCR).
- **Efficient Deploy**: The production server will only pull pre-built images, minimizing CPU/RAM usage during updates.

### Database Stability
- **Prisma Migrations**: Move from `db push --accept-data-loss` to `prisma migrate deploy`.
- **Idempotency**: Ensure all database-related tasks (seeding, migrations) are safe to run multiple times without creating duplicates.

### Infrastructure Alignment
- **Proxy Consistency**: Maintain compatibility with Nginx Proxy Manager and its path-based routing (`/iter`, `/iter/api`).

## Related Specifications
- [Monorepo Structure](file:///Users/kore/Documents/Code/Projects/iter-ecosystem-enginy/openspec/specs/infrastructure/monorepo.md) (assumed path)
- [Database Schema](file:///Users/kore/Documents/Code/Projects/iter-ecosystem-enginy/openspec/specs/database/schema.md) (assumed path)
