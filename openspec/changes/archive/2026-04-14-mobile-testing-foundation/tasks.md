## 1. Infrastructure Setup (Jest & RTL)

- [x] 1.1 Add Jest and Testing Library dependencies to `apps/mobile/package.json`
- [x] 1.2 Create `apps/mobile/jest.config.js` with `jest-expo` preset
- [x] 1.3 Create `apps/mobile/jest.setup.js` for native module mocks
- [x] 1.4 Update `apps/mobile/package.json` test script to run `jest`
- [x] 1.5 Configure `tsconfig.json` in mobile to include test types

## 2. Component & Unit Testing

- [x] 2.1 Implement first unit test for an API service (e.g., `services/api.js`)
- [x] 2.2 Implement first component test using RTL (e.g., a simple button or text component)
- [x] 2.3 Create common mocks for `expo-secure-store` and `expo-router`
- [x] 2.4 Verify that tests pass with NativeWind styles

## 3. E2E Setup (Maestro)

- [x] 3.1 Install Maestro CLI locally and document requirements (simulator/emulator)
- [x] 3.2 Create `.maestro/` directory in `apps/mobile/`
- [x] 3.3 Create `login-flow.yaml` to verify basic authentication flow
- [x] 3.4 Create `attendance-flow.yaml` to verify session management and attendance marking

## 4. Monorepo Integration

- [x] 4.1 Update root `package.json` to include mobile in `verify` and `test` scripts
- [x] 4.2 Update `turbo.json` to manage cache for mobile test tasks
- [x] 4.3 Verify that `npm run verify` from root correctly triggers mobile Jest tests
