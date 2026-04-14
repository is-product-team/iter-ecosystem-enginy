## 1. Dependency Dedensification (Infra)

- [x] 1.1 **Refactor `@iter/shared`**: Move any accidental React dependencies to `peerDependencies` and `devDependencies` to ensure it remains environment-agnostic.
- [x] 1.2 **Seal Root Singletons**: Audit and synchronize `react`, `react-dom`, `typescript`, and `zod` versions in the root `package.json` to establish the monorepo source of truth.

## 2. Automation Component

- [x] 2.1 **Create Hygiene Script**: Implement `scripts/monorepo-hygiene.mjs` using Node.js filesystem APIs.
- [x] 2.2 **Implement Purge Logic**: The script SHALL identify and delete `react` and `react-dom` directories inside `apps/*/node_modules`.
- [x] 2.3 **Implement Version Guard**: The script SHALL verify that workspace packages do not declare conflicting versions of the root singletons.
- [x] 2.4 **Register Command**: Add the `hygiene` command to the root `package.json` scripts.

## 3. Pipeline Enforcement

- [x] 3.1 **Turbo Configuration**: Define a new `hygiene` task in `turbo.json`.
- [x] 3.2 **Dependency Chain**: Update `dev`, `build`, and `lint` tasks in `turbo.json` to depend on `^hygiene`, ensuring constant compliance.

## 4. Final Validation

- [x] 4.1 **System-wide Audit**: Run `npm run hygiene` and verify it reports a clean state.
- [x] 4.2 **Conflict Simulation**: Manually install an older React version in `apps/mobile` and verify the hygiene system detects and corrects it during `npm run dev`.
