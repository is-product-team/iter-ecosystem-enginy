## ADDED Requirements

### Requirement: Duplicate Singleton Detection
The system SHALL detect and purge duplicate installations of singleton-required packages (specifically `react` and `react-dom`) within workspace `node_modules` directories.

#### Scenario: Conflicting local React in mobile app
- **WHEN** the hygiene script is executed and `apps/mobile/node_modules/react` is found
- **THEN** the system SHALL delete the folder and output a cleanup confirmation message.

### Requirement: Peer Dependency Hygiene
Internal shared packages (specifically `@iter/shared`) SHALL NOT declare `react` or `react-dom` as direct dependencies, ensuring they consume the consumer's React instance.

#### Scenario: Shared package structure audit
- **WHEN** the hygiene script audits `shared/package.json`
- **THEN** it SHALL verify that `react` is not present in the `dependencies` block.

### Requirement: Version Invariant Enforcement
The system SHALL verify that core tool versions (specifically `typescript` and `zod`) are consistent between the root `package.json` and all workspace packages.

#### Scenario: TypeScript version drift
- **WHEN** a workspace package uses `typescript@^4` but the root uses `typescript@^5`
- **THEN** the hygiene check SHALL fail and report the inconsistency.

### Requirement: Pipeline Integration
The hygiene check SHALL be a prerequisite for both development and production build tasks.

#### Scenario: Developer starts dev server
- **WHEN** `npm run dev` is executed via Turborepo
- **THEN** the `hygiene` task SHALL run first, failing the start if any policy violations are found.
