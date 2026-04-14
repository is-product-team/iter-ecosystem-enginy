## Context

The current architecture uses a separate `packages/shared` workspace which requires its own `package.json`, build scripts, and complex ESM module resolution settings. This design proposes converting it into a simple root-level direct source dependency.

## Goals / Non-Goals

**Goals:**
- Eliminate the `@iter/shared` workspace and its associated overhead.
- Enable direct, extension-free imports in both `api` and `web` environments.
- Consolidate common dependencies in the root `package.json`.

**Non-Goals:**
- Merging `api` and `web` into a single codebase.
- Removing separate `node_modules` for each app (isolated dependencies are preserved).
- Changing any application logic.

## Decisions

### 1. Root Shared Directory
Move all files from `packages/shared/` to a new `/shared/` directory at the project root. This directory will NOT contain a `package.json`.

### 2. TypeScript Path Mapping
Both `apps/api/tsconfig.json` and `apps/web/tsconfig.json` will be updated to point the `@iter/shared` alias directly to the source file in the root.

```ascii
Project Root
├── apps/
│   ├── api/ (NodeNext ESM)
│   └── web/ (Bundler ESM)
├── shared/
│   ├── index.ts
│   └── theme.ts
└── package.json (Consolidated shared deps)
```

### 3. ESM Compliance Fix
Remove the artificial `.js` extensions added to `shared` imports. Since the code is now treated as local source within each project, the individual `tsconfig.json` settings will handle the resolution naturally without strict external package rules.

## Risks / Trade-offs

- **Risk**: Circular dependencies between `api` and `shared` could be introduced more easily.
- **Trade-off**: Loss of per-package Turbo caching for the shared code (negligible for 3 files).
