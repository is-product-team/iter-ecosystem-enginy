# Maestro E2E Testing Guide

Maestro is used for End-to-End testing in the `@iter/mobile` application.

## Prerequisites

1. **Maestro CLI**: Install it using the following command:
   ```bash
   curl -Ls "https://get.maestro.mobile.dev" | bash
   ```
2. **Simulator/Emulator**:
   - **iOS**: Xcode Simulator must be installed and running.
   - **Android**: Android Emulator (AVD) must be installed and running via Android Studio.

## Running Tests

1. Start your development server:
   ```bash
   cd apps/mobile
   npm run start
   ```
2. In a new terminal, run the Maestro tests:
   ```bash
   cd apps/mobile
   maestro test .maestro/login-flow.yaml
   ```

## Writing Flows

Maestro flows are written in YAML and stored in the `apps/mobile/.maestro/` directory.

Example:
```yaml
appId: com.iter.mobile
---
- launchApp
- tapOn: "Login"
- inputText: "test@example.com"
- tapOn: "Password"
- inputText: "password123"
- tapOn: "Submit"
- assertVisible: "Dashboard"
```
