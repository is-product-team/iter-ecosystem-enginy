## Why

The current monorepo structure suffers from dependency fragmentation between Next.js (Web) and Expo (Mobile), frequently leading to duplicate React instances and runtime crashes (Invalid hook call). There is no automated mechanism to enforce the "Singleton Pattern" required for cross-platform stability.

## What Changes

- **Root Singleton Enforcement**: Standardize core dependencies (React, React-DOM, TypeScript, Zod) in the root `package.json` using `overrides`.
- **Peer Dependency Standards**: Refactor `@iter/shared` to treat React as a `peerDependency`, preventing multiple React instances from being bundled.
- **Automated Hygiene Script**: Implement a `scripts/hygiene.mjs` tool to detect and automatically purge conflicting `node_modules` in workspace apps.
- **Pipeline Integration**: Add a `hygiene` task to `turbo.json` that runs before `dev` and `build` to ensure a healthy state.

## Capabilities

### New Capabilities
- `monorepo-hygiene`: Systemic enforcement of dependency singleton patterns and version alignment across Web, Mobile, and API.

### Modified Capabilities
<!-- No requirement changes to existing business logic capabilities. -->

## Impact

- **Root `package.json`**: New `overrides` and `hygiene` script registration.
- **Apps (`web`, `mobile`)**: Unified versions and removed local React/React-DOM declarations.
- **Shared Package**: Dependency structure update.
- **Workflow**: Turbo pipeline will now include a mandatory compliance check.
