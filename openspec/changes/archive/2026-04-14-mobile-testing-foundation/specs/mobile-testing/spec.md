## ADDED Requirements

### Requirement: Unit Testing Suite
The `@iter/mobile` workspace SHALL have a functional unit testing suite using Jest.

#### Scenario: Running unit tests
- **WHEN** developer runs `npm run test` in the mobile workspace
- **THEN** Jest executes all `*.test.ts` files and reports results

### Requirement: Component Testing
The system SHALL support component testing using React Testing Library for React Native.

#### Scenario: Testing a component render
- **WHEN** a test renders a component using `@testing-library/react-native`
- **THEN** it can query elements and assert their presence or properties

### Requirement: Native Module Mocking
The testing environment SHALL provide standardized mocks for common Expo and React Native modules.

#### Scenario: Mocking SecureStore
- **WHEN** a component uses `expo-secure-store` during a test
- **THEN** the mock prevents native module errors and returns deterministic values

### Requirement: E2E Automation with Maestro
The project SHALL include automated End-to-End (E2E) flows for critical mobile features using Maestro.

#### Scenario: Running a Maestro flow
- **WHEN** developer runs `maestro test` with a defined YAML flow
- **THEN** the flow executes on a running simulator/emulator and validates the assertions
