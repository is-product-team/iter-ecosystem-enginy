# Design: Professional Build & Deploy Pipeline

## Architecture Overview

The new deployment architecture shifts the computational load from the production server to GitHub's CI environment.

```ascii
GITHUB ACTIONS (CI)                   PRODUCTION SERVER (VPS)
┌───────────────────────┐             ┌─────────────────────────┐
│                       │             │                         │
│  1. Build Images      │             │  4. Pull Images         │
│     (Next.js, API)    │             │     from GHCR           │
│                       │             │                         │
│  2. Push to GHCR      │────────────▶│  5. Run Migrations      │
│     (Registry)        │             │     (prisma migrate)    │
│                       │             │                         │
│                       │             │  6. Restart Services    │
│                       │             │     (Docker Compose)    │
└───────────────────────┘             └─────────────────────────┘
            │                                      ▲
            │                                      │
            └──────────────────────────────────────┘
                   SSH/Runner Signal
```

## Database Migration Strategy
We will transition from `npx prisma db push` to `npx prisma migrate deploy`.

1.  **Baseline**: Generate an initial migration that represents the current schema status.
2.  **Deployment**: The deployment workflow will run `migrate deploy` before restarting the app containers. This ensures the schema is always ready before the application starts.

## Path-Based Routing Configuration
The application is served behind Nginx Proxy Manager using subpaths.

- **Frontend**: Served at `https://projects.kore29.com/iter`
    - Regulated by `next.config.ts` -> `basePath: '/iter'`.
- **Backend**: Served at `https://projects.kore29.com/iter/api`
    - Regulated by `API_PREFIX` in Express.

## Docker Optimization
- Use specific `target` stages in `Dockerfile` for `runner-api` and `runner-web`.
- Use the `standalone` output for Next.js to minimize image footprint.
- Pull images from `ghcr.io/is-product-team/iter-ecosystem-enginy/{app}:latest`.
