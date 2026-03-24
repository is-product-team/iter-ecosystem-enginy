# Proposal: Setup Testing Infrastructure

## Why

The Iter Ecosystem is currently a "Testing Desert" with 0% automated test coverage. Critical business logic in areas like AI-driven scheduling, NLP presence detection, and Vision AI document validation is unverified and highly susceptible to regressions. 

Introducing a professional testing infrastructure will:
- **Reduce Risk**: Catch bugs before they reach production.
- **Improve Developer Confidence**: Allow for safe refactoring of complex services.
- **Enforce Quality**: Block broken deployments via CI/CD integration.

## What Changes

1. **Test Framework Selection**: Implementation of **Vitest** for unit and integration testing across the monorepo.
2. **Environment Configuration**: Setup of `vitest.config.ts` and Prisma test environments for database-linked services.
3. **Continuous Integration**: Update of `.github/workflows/deploy-self-hosted.yml` to include `lint`, `type-check`, and `test` stages.
4. **Initial Test Coverage**: Creation of unit tests for the most critical services (`AutoAssignmentService`, `NLPService`, `VisionService`).

## Capabilities

### New Capabilities
- `automated-testing`: Core infrastructure for running unit and integration tests across all monorepo packages.
- `ci-validation`: Automated quality gate integrated into the deployment pipeline to prevent regressions.

### Modified Capabilities
- `scheduling`: Added requirements for algorithmic verification of "Fair Share" and "Round Robin" logic.
- `attendance-telemetry`: Added requirements for verifying NLP keyword detection and sentiment analysis accuracy.
- `validation`: Added requirements for verifying Vision AI mock responses and document handling.

## Impact

- **`apps/api`**: Addition of `vitest` dependency and test files for services/controllers.
- **`packages/shared`**: Addition of unit tests for Zod schemas and theme tokens.
- **`.github/workflows`**: Update to `deploy-self-hosted.yml` to enforce quality checks.
- **Developer Workflow**: Developers will now be required to run tests locally before pushing.
