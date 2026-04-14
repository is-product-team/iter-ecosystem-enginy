## Context

The monorepo structure currently contains redundant "proxy" files in the root directory (`App.js`, `app.json`, `app/` folder) that were intended to simplify execution but are now causing Expo and Metro to misidentify the application's root. This leads to a loss of the specialized styling configuration defined in `apps/mobile/tailwind.config.js` and `apps/mobile/global.css`. Additionally, NativeWind v4 requires a precise Babel transform that is being bypassed when the app starts from the monorepo root.

## Goals / Non-Goals

**Goals:**
- Eliminate entry point ambiguity by removing root-level Expo/React Native files.
- Restore styling by ensuring NativeWind's Babel plugin and Metro configuration are correctly applied to `apps/mobile`.
- Verify the compatibility of React 19 and React Native 0.81.5 with the current NativeWind v4 setup.

**Non-Goals:**
- Refactoring the entire UI; the goal is strictly to restore the existing styles.
- Changing the underlying monorepo manager (Turborepo).
- Downgrading React or React Native unless it's the only way to make NativeWind work (last resort).

## Decisions

### 1. Root Directory De-cluttering
We will remove the following files from the root:
- `App.js` (proxy)
- `app.json` (proxy/stub)
- `app/` (folder with "Hello World" index)
- `metro.config.js` (proxy)
- `babel.config.js` (proxy)

**Rationale**: These files were created to allow `npx expo start` from the root, but they create a "Shadow Root" that confuses the tooling. Running from within `apps/mobile` is the standard and safest approach for a clean build.

### 2. Isolated Mobile Configuration
We will enforce the use of `apps/mobile` as the working directory for all mobile commands.
- **Turborepo Integration**: Update `turbo.json` or root `package.json` scripts to ensure `--filter=@iter/mobile` is always used.

### 3. NativeWind v4 Pipeline Fix
We will ensure that `apps/mobile/babel.config.js` uses `nativewind/babel` correctly and that `metro.config.js` in `apps/mobile` is the only one active.

```ascii
Architecture Flow:
[CLI: npm run mobile:dev] 
      │
      ▼
[Turbo: filter=@iter/mobile]
      │
      ▼
[Directory: apps/mobile] ───┐
      │                     │
      ▼                     ├─> [Babel: nativewind/babel] ──> JS Transformation
[Metro Bundler] <───────────┘
      │
      ▼
[Native App (React 19)] <─── [CSS Injection (global.css)]
```

## Risks / Trade-offs

- **[Risk]**: Removing root files might break old scripts. 
  - **Mitigation**: Update root `package.json` scripts to point explicitly to workspaces.
- **[Risk]**: React 19 compatibility. NativeWind v4 is in beta/early stable; React 19 is very new. 
  - **Mitigation**: Check for `nativewind` updates and ensure `jsxImportSource: "nativewind"` is correctly set in Babel.
- **[Risk]**: Metro Cache. 
  - **Mitigation**: Run with `--clear` after making structural changes.
