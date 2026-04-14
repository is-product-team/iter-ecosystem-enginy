## ADDED Requirements

### Requirement: Standardized Domain Constants
All domain constants (ROLES, REQUEST_STATUSES, PHASES) defined in `packages/shared` MUST have English keys but the VALUES must exactly match the strings expected by the underlying PostgreSQL database.

#### Scenario: Role Verification
- **WHEN** a user logs in with role 'ADMIN'
- **THEN** the `ROLES.ADMIN` constant must evaluate to 'ADMIN'.

#### Scenario: Request Status Verification
- **WHEN** checking for an approved request in Catalan
- **THEN** the `REQUEST_STATUSES.APPROVED` constant must evaluate to 'Aprovada' (NOT 'Approved').

### Requirement: ESM Compliance in Shared Package
The `packages/shared` package must follow ESM naming conventions, specifically omitting file extensions in import statements.

#### Scenario: Internal Import
- **WHEN** `index.ts` imports from `theme.ts`
- **THEN** the import must be written as `import { ... } from './theme';`.
