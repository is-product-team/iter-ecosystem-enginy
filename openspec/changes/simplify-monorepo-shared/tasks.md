## 1. Directory Restructuring

- [x] 1.1 Create `/shared` directory at the project root.
- [x] 1.2 Move `packages/shared/index.ts` and `packages/shared/theme.ts` to `/shared`.
- [x] 1.3 Delete `packages/shared/` directory and its `package.json`.

## 2. Dependency Management

- [x] 2.1 Add `zod` and any other shared dependencies to the root `package.json`.
- [x] 2.2 Remove `@iter/shared` from `apps/api/package.json` and `apps/web/package.json`.
- [x] 2.3 Remove `packages/*` from the root `package.json` workspaces list.

## 3. Configuration Updates

- [x] 3.1 Update `apps/api/tsconfig.json` paths to map `@iter/shared` to `../../shared/index.ts`.
- [x] 3.2 Update `apps/web/tsconfig.json` paths to map `@iter/shared` to `../../shared/index.ts`.
- [x] 3.3 Ensure `apps/web/next.config.js` (if it exists) has `transpilePackages: ['shared']` or equivalent if needed.
- [x] 3.4 **Fix Shared Imports**: Remove the `.js` extensions from imports in `/shared/index.ts`.

## 4. Verification

- [x] 4.1 Run `npm install` from root to refresh symlinks and workspaces.
- [x] 4.2 Run `npm run verify` to ensure all workspaces build and pass lint.
