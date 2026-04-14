## Why

The `@iter/mobile` application currently has no automated tests ("No tests yet" script). As the project scales with complex features like GPS telemetry and automated enrollment, manual testing is insufficient to ensure stability. Implementing a robust testing foundation is critical to prevent regressions, especially when making cross-cutting changes in the `@iter/shared` library or the backend API.

## What Changes

- **Testing Infrastructure**: Introduction of Jest and React Testing Library (RTL) for unit and component testing in the mobile workspace.
- **E2E Automation**: Implementation of Maestro for high-level user flow verification (Login, Session Management, Attendance).
- **CI Integration**: Integration of mobile tests into the `npm run verify` workflow.
- **Standardization**: Establishment of patterns for mocking native modules (Expo, Reanimated) and handling NativeWind styles in tests.

## Capabilities

### New Capabilities
- `mobile-testing`: Core infrastructure and patterns for testing the React Native application, including Jest config, RTL setup, and common mocks.

### Modified Capabilities
- `testing`: General project testing guidelines and requirements to include mobile-specific standards.

## Impact

- **@iter/mobile**: New `devDependencies` (jest, @testing-library/react-native, jest-expo, maestro-cli), new configuration files, and initial test suites.
- **Root Workspace**: Update `npm run verify` and `turbo.json` to include mobile test execution.
- **Development Workflow**: Developers will now be required to pass mobile tests before pushing changes.
