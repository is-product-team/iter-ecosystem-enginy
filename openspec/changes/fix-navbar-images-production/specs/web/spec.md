## ADDED Requirements

### Requirement: Static Image Imports for Core UI
The web frontend SHALL use static image imports (imported as objects, not strings) for all core UI elements like logos, favicons, and background assets to ensure reliable rendering in production environments.

#### Scenario: Navbar logo rendering
- **WHEN** the production build is served
- **THEN** the Iter logo in the Navbar (both light and dark modes) MUST display correctly using the resolved static path from the build.

#### Scenario: Logo consistency across components
- **WHEN** any shared UI component uses a company logo
- **THEN** it MUST use a static import from the `@/public` directory to ensure path consistency and cache optimization.
