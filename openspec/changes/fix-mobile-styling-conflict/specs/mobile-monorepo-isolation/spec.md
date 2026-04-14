## ADDED Requirements

### Requirement: Mobile Workspace Isolation
The system SHALL ensure that the mobile application execution is strictly isolated to the `apps/mobile` directory, preventing the root directory from acting as a "Shadow Root" for Expo or Metro.

#### Scenario: Running mobile development
- **WHEN** the user executes `npm run mobile:dev` from the monorepo root
- **THEN** the command SHALL delegate execution to `apps/mobile` using the local `metro.config.js` and `babel.config.js`

### Requirement: NativeWind Styling Integrity
The system SHALL guarantee that NativeWind v4 styles are correctly transformed and injected into React 19 components by enforcing the `jsxImportSource: "nativewind"` configuration in Babel.

#### Scenario: Style visibility
- **WHEN** a component with Tailwind classes is rendered
- **THEN** the system SHALL apply the styles defined in `apps/mobile/global.css` and the local `tailwind.config.js`
