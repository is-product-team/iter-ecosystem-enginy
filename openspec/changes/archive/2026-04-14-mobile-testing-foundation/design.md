## Context

The `@iter/mobile` app is built with Expo and NativeWind but lacks an automated testing suite. To ensure long-term stability in a monorepo environment, we need a multi-layered testing strategy that covers unit logic, component rendering, and end-to-end user flows.

## Goals / Non-Goals

**Goals:**
- Establish a standard Jest configuration for Expo in the mobile workspace.
- Implement React Testing Library for component verification.
- Configure Maestro for automated E2E flows on local simulators.
- Provide a set of reusable mocks for native modules.
- Integrate mobile tests into the root `npm run verify` command.

**Non-Goals:**
- Achieving 100% code coverage in this initial phase.
- Setting up a CI/CD pipeline for automated E2E (Maestro) in GitHub Actions (local execution only for now).
- Testing web-specific features in the mobile suite.

## Decisions

### 1. Test Runner: Jest (over Vitest)
**Rationale**: While the rest of the monorepo uses Vitest, Jest is significantly more mature and better supported in the React Native/Expo ecosystem. Using `jest-expo` provides pre-configured transforms and mocks that are difficult to replicate in Vitest.
**Alternatives**: Vitest with `vitest-canvas-mock` (Too experimental for RN at this stage).

### 2. E2E Tool: Maestro (over Detox)
**Rationale**: Maestro uses a YAML-based declaration and doesn't require "gray-box" integration with the app's binary. It is faster to set up and easier for non-developers to read/write.
**Alternatives**: Detox (More powerful but requires complex native configuration and slower build times).

### 3. Component Testing: React Testing Library (RTL)
**Rationale**: Standard industry practice. Focuses on testing user behavior rather than implementation details.
**Alternatives**: Enzyme (Deprecated).

### 4. Mocking Strategy: Manual Mocks + `jest-expo`
**Rationale**: Use `jest-expo` for basic Expo modules and maintain a `__mocks__` directory for complex ones like `expo-secure-store` or `react-native-reanimated`.

```text
┌──────────────────────────────────────────────────────────┐
│                  MOBILE TESTING ARCHITECTURE             │
├──────────────────────────────────────────────────────────┤
│                                                          │
│   ┌──────────────┐      ┌──────────────┐                 │
│   │   Maestro    │ ───▶ │   Running    │ (E2E)           │
│   │   (.yaml)    │      │   Simulator  │                 │
│   └──────────────┘      └──────────────┘                 │
│          │                                               │
│          ▼                                               │
│   ┌──────────────┐      ┌──────────────┐                 │
│   │     Jest     │ ───▶ │  Components  │ (Integration)   │
│   │   (Unit/Int) │      │  (RTL + Mock)│                 │
│   └──────────────┘      └──────────────┘                 │
│          │                                               │
│          ▼                                               │
│   ┌──────────────┐                                       │
│   │ Shared Logic │ (Unit)                                │
│   │ (@iter/shared)│                                      │
│   └──────────────┘                                       │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## Risks / Trade-offs

- **[Risk] Native Module Explosions** → [Mitigation] Maintain a robust `jest.setup.js` with comprehensive mocks.
- **[Risk] Flaky E2E Tests** → [Mitigation] Use Maestro's built-in wait mechanisms and clear state before each run.
- **[Risk] Test Runner Divergence** → [Mitigation] Accept Jest for mobile while keeping Vitest for Web/API to minimize configuration friction.
