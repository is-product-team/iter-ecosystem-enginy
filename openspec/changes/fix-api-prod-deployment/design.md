## Context

The Backend API fails in production due to two primary issues:
1. **Module Resolution (ESM)**: Node.js 22 in ESM mode requires explicit `.js` extensions for local module imports. The `shared` package is being imported without these extensions, causing an `ERR_MODULE_NOT_FOUND` error.
2. **Build/Container Structure**: The `Dockerfile` structure for the `runner-api` stage does not align with how `tsc` outputs compiled code when `rootDir` is set to the monorepo root. This leads to missing or misplaced compiled dependencies (like the `shared` package).
3. **Environment Validation**: The API crashes during startup because it fails to find the `.env` file it expects, even though the required variables are provided by the Docker environment.

## Goals / Non-Goals

**Goals:**
- Fix the API startup crash in production.
- Ensure proper ESM resolution for cross-package imports.
- Align the Docker production image with the compiled output structure.
- Make environment variable loading resilient to container structure changes.
- Restore the `ollama` service for document validation in production.

**Non-Goals:**
- Refactoring the entire monorepo build system.
- Changing the TypeScript configuration (other than necessary fixes).
- Implementing new features or business logic.

## Decisions

### 1. ESM Explicit Extensions in `shared`
- **Decision**: Update internal imports in `shared/index.ts` to include `.js` extensions.
- **Rationale**: Node.js ESM requires extensions. TypeScript's compiler will maintain these extensions in the output, and it's the standard way to handle ESM in TS.
- **Alternatives**: Using a bundler like `tsup` or `esbuild` for `shared`. *Rejected* to keep the current simple `tsc` setup and avoid new dependencies.

### 2. Docker Image Structure Alignment
- **Decision**: Update `Dockerfile` to copy the entire `dist` folder to the runner stage and adjust the `CMD` to point to the correct entry path.
- **Rationale**: Since `tsc` produces a nested structure in `dist` (e.g., `dist/apps/api/src/index.js` and `dist/shared/index.js`), copying the whole `dist` ensures all relative imports between packages are preserved.
- **ASCII Diagram:**
```
/app
├── node_modules
├── apps
│   └── api
│       └── dist (Target for runner-api)
│           ├── apps/api/src/index.js  <-- Entry Point
│           └── shared/index.js         <-- Shared logic
└── shared (Source, only for builder)
```

### 3. Resilient Environment Loading
- **Decision**: Modify `apps/api/src/config/env.ts` to skip `dotenv` if critical variables (`DATABASE_URL`) are already present in `process.env`. Fix the fallback path to be more robust.
- **Rationale**: In production Docker, variables are usually injected directly. Falling back to a physical file is a secondary safety measure, not a requirement.

## Risks / Trade-offs

- **[Risk]** Breaking local development with `.js` extensions in TS files. 
  - **Mitigation**: Modern TypeScript (4.7+) and `tsx` handle `.js` extensions in imports correctly by resolving to the corresponding `.ts` source file.
- **[Risk]** Increased Docker image size by copying more from `dist`.
  - **Mitigation**: The size increase is negligible compared to the stability gain. Only compiled code and `node_modules` are copied.
