# Tasks: Setup Testing Infrastructure

## 1. Core Framework & Shared Logic

- [x] 1.1 Install `vitest` and `typescript` as dev dependencies in the root.
- [x] 1.2 Add `vitest` and configure `vitest.config.ts` in `packages/shared`.
- [x] 1.3 Create unit tests for `@iter/shared` (Zod schemas and theme tokens).
- [x] 1.4 Add a `test` script to `packages/shared/package.json`.

## 2. Backend API Infrastructure

- [x] 2.1 Install `vitest`, `supertest`, and `vitest-mock-extended` in `apps/api`.
- [x] 2.2 Configure `apps/api/vitest.config.ts` (handle `@iter/shared` alias).
- [x] 2.3 Establish a base mocking strategy for the Prisma client.
- [x] 2.4 Add a `test` script to `apps/api/package.json`.
- [x] 2.5 Implement unit tests for `NLPService` (keyword detection).
- [x] 2.6 Implement unit tests for `VisionService` (validation logic).
- [x] 2.7 Implement unit tests for `AutoAssignmentService`.

## 3. Web & Frontend Testing

- [x] 3.1 Install `vitest` and `jsdom` in `apps/web`.
- [x] 3.2 Configure `apps/web/vitest.config.ts`.
- [x] 3.3 Add `test` script to `apps/web/package.json`.
- [x] 3.4 Implement a baseline verification test for the landing page.

## 4. CI/CD Integration & PR Automation

- [x] 4.1 Create a root `verify` script (monorepo-wide lint, type-check, test).
- [x] 4.2 Update `.github/workflows/deploy-self-hosted.yml` with the `verify` job.
- [x] 4.3 Create `.github/workflows/pr-verify.yml` for automated Pull Request checks.
- [x] 4.4 Identify and remove legacy CodeQL workflows (Verified: none found in .github/workflows).
- [x] 4.5 Validate the quality gate locally.

## 5. Verification & Finalization

- [x] 5.1 Run the full `verify` suite locally.
- [x] 5.2 Validate the GitHub Action behavior (simulated or manual push).
- [x] 5.3 Finalize the OpenSpec change and archive.
