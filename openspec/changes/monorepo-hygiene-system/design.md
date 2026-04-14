## Context

In our monorepo, `apps/web` (Next.js) and `apps/mobile` (Expo) share logic via `@iter/shared`. Because both environments rely on React but have different bundling requirements, standard npm hoisting often produces "Duplicate React" instances. This causes the React dispatcher to fail (`Invalid hook call`).

Current State:
- Manual deduplication is required after `npm install`.
- Versions of core tools (TypeScript, Zod) tend to drift between packages.

## Goals / Non-Goals

**Goals:**
- **Zero-Manual-Cleanup**: Automate the removal of conflicting workspace `node_modules`.
- **Single React Dispatcher**: Guarantee a singleton React instance (v19.1.0) for both Web and Mobile.
- **Consistency**: Enforce identical versions of TypeScript and Zod across the entire monorepo.

**Non-Goals:**
- Migrating to `pnpm` or `yarn` at this stage.
- Modifying the native build process of Expo or Next.js beyond dependency resolution.

## Decisions

### 1. Root Singleton Ownership
Core dependencies (`react`, `react-dom`, `typescript`, `zod`) will be moved to the root `package.json` as direct dependencies. Workspace `package.json` files will no longer declare these versions locally.
- **Rationale**: If a workspace doesn't declare a dependency, `npm` is forced to look up to the root.
- **Alternative**: Using `peerDependencies` in every app (too verbose and error-prone).

### 2. Standalone Hygiene Tool (`scripts/hygiene.mjs`)
A Node.js script will be created to audit the monorepo structure.
- **Action**: It will scan `apps/*/node_modules/` and `shared/node_modules/`.
- **Operation**: If it finds any folder named `react` or `react-dom` inside a workspace's `node_modules`, it will delete it.
- **Rationale**: NPM sometimes re-installs these locally despite overrides; an automated purge is the only reliable fix to ensure the singleton pattern.

### 3. Turborepo Barrier
Integrate the hygiene check into `turbo.json`.
```json
{
  "tasks": {
    "hygiene": {
      "cache": false
    },
    "dev": {
      "dependsOn": ["^hygiene"]
    }
  }
}
```
- **Rationale**: Developers cannot start the dev server without passing the hygiene check.

## Risks / Trade-offs

- **[Risk] Unexpected Deletions** → Mitigation: The script will only target a specific whitelist of singleton packages (`react`, `react-dom`).
- **[Trade-off] Install Time** → Mitigation: The script runs in milliseconds; the only overhead is the potential linking `npm` performs.

## ASCII Architecture

```text
       [ Turborepo Pipeline ]
                │
                ▼
       [ Task: hygiene ] ──────▶ [ scripts/hygiene.mjs ]
                │                 │
                │                 ├─▶ Audit apps/mobile/node_modules
                │                 ├─▶ Audit apps/web/node_modules
                │                 └─▶ PURGE if react/react-dom found
                ▼
       [ Task: dev/build ]
```
