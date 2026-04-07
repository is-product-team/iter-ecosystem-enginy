# Capability: developer-guides

The suite of guides providing procedural and structural knowledge for developers to onboard and maintain the project.

## Requirements

### Requirement: Institutional English
All primary documentation files must be written in professional English to ensure international project accessibility.

#### Scenario: Unified Language
- **WHEN** a developer browses the `docs/` directory
- **THEN** all files are written in coherent, standard English.

### Requirement: Role-Based Documentation Clarity
The documentation must include a map between authentication roles and the seed credentials.

#### Scenario: Onboarding login
- **WHEN** a developer needs to test a feature as a `TEACHER`
- **THEN** they can find the exact email (e.g., `laura.martinez@brossa.cat`) and password in the `auth-and-roles.md` guide.

### Requirement: Environment Setup Guidance
Documentation must specify the core environment variables and Docker mapping for the monorepo services.

#### Scenario: First run
- **WHEN** a developer runs `docker compose up --build`
- **THEN** they can verify the correct ports (e.g., `:3000` for Web) using the `getting-started.md` guide.
