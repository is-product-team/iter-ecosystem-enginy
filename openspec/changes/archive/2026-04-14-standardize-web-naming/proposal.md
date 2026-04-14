## Why

The backend data layer has been standardized to an English-first naming convention (e.g., `fullName`, `name`, `centerCode`). Currently, `apps/web` relies on legacy Catalan identifiers defined in local interfaces and components. This creates a "silent failure" where the application builds but fails at runtime when communicating with the updated API.

## What Changes

- Refactor `apps/web/lib/auth.ts` to use English properties for the `User` interface.
- Update all components in `apps/web/app` and `apps/web/components` that consume the auth context or display user/center data.
- Harmonize API services in `apps/web/services` to use English field names for both request bodies and response handling.

## Capabilities

### New Capabilities
- `web-naming-standardization`: Ensures the web application is fully compatible with the English-first API contract.

### Modified Capabilities
- None.

## Impact

- `apps/web`: Comprehensive refactoring of interfaces and property access.
- `packages/shared`: Potential (though already mostly handled) to ensure Enums are correctly used.
