## ADDED Requirements

### Requirement: Root-Level Shared Source
The shared domain logic must be accessible as local source code within the project root, without being a formal NPM workspace package.

#### Scenario: Shared Constant Import
- **WHEN** the API or Web app imports a constant like `ROLES`
- **THEN** it must resolve directly to `root/shared/index.ts` via TypeScript path mapping.

#### Scenario: Unified Dependency Management
- **WHEN** a shared dependency like `zod` is updated
- **THEN** it should be managed in the root `package.json` to ensure consistency.

### Requirement: ESM Resolution Compatibility
Relative imports within the shared folder must not require artificial extensions (like `.js`) to work across different app environments.

#### Scenario: Internal Shared Import
- **WHEN** `shared/index.ts` imports `./theme`
- **THEN** it should work in both `api` (NodeNext) and `web` (Bundler) without file extensions.
