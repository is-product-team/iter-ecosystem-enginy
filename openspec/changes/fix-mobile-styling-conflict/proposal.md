## Why

The mobile application's design has "disappeared" due to a structural conflict within the monorepo. Multiple entry points and configuration files in the root directory are interfering with the specialized configuration in `apps/mobile`. Additionally, the use of an experimental React Native version (0.81.5) with React 19 is causing styling injection failures in NativeWind v4.

## What Changes

- **Cleanup of Root Directory**: Remove redundant `app/`, `App.js`, `app.json`, `metro.config.js`, and `babel.config.js` from the monorepo root to prevent Expo/Metro from picking up the wrong entry point.
- **Unified Mobile Configuration**: Ensure all mobile-related execution happens within the `apps/mobile` context, using its local configurations.
- **NativeWind v4 Restoration**: Fix the Babel and Metro pipeline to ensure Tailwind classes are correctly transformed and injected into the React Native components.
- **Dependency Alignment**: Adjust `package.json` overrides if necessary to ensure React Native 0.81.5 and React 19 compatibility with NativeWind.

## Capabilities

### New Capabilities
- `mobile-monorepo-isolation`: A set of rules and configurations to ensure the mobile app runs independently of root-level experimental files.

### Modified Capabilities
- `mobile`: The core mobile capability requirements are being updated to ensure consistent styling and layout in the monorepo environment.

## Impact

- **apps/mobile**: Primary target for configuration fixes.
- **Root Directory**: Removal of several proxy/boilerplate files that cause confusion.
- **Build Pipeline**: Turborepo and Metro configurations will be more robust and isolated.
