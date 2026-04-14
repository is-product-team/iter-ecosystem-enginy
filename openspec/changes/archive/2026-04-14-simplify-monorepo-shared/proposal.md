## Why

The current monorepo uses `npm workspaces` for the `@iter/shared` package, which introduces significant configuration overhead and friction:
- **Module Resolution Issues**: The mismatch between `api` (NodeNext) and `web` (Bundler) requires non-standard import extensions (e.g., `.js` in TS files) to satisfy strict ESM rules.
- **Dependency Redundancy**: Managing multiple `package.json` files for a small project complicates dependency syncing.
- **Build Complexity**: Tools like Turbo add a layer of abstraction that can obscure caching issues and stale types.

Simplifying the structure by moving shared code to a root folder eliminates these issues while maintaining the benefits of a shared domain layer.

## What Changes

- **Move Shared Code**: Move contents of `packages/shared/` to a new root directory `/shared`.
- **Remove Workspace**: Delete the `@iter/shared` workspace and its associated `package.json`.
- **Update Paths**: Configure `api` and `web` to import directly from the root `/shared` folder via TypeScript path mappings.
- **Unified Dependencies**: Consolidate common dependencies (like `zod`) to the root `package.json`.

## Capabilities

### New Capabilities
- `lean-monorepo`: A simplified, single-workspace architecture that treats shared code as a local source directory rather than a local package.

### Modified Capabilities
- `shared-domain`: The shared domain logic (constants, schemas, types) is preserved but moved to a more accessible location.

## Impact

- **API**: Updates `tsconfig.json` paths and removes `@iter/shared` from `package.json`.
- **Web**: Updates `tsconfig.json` paths and removes `@iter/shared` from `package.json`.
- **Root**: Updates `workspaces` config and absorbs shared dependencies.
