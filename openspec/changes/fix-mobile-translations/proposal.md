## Why

Several mobile translations are displaying keys (variables) instead of the actual translated text. This is primarily caused by a duplicated `Session` block in the JSON locale files which overwrites essential keys, and the absence of several keys used in the codebase. This degrades the user experience and accessibility for teachers using the mobile app.

## What Changes

- **Consolidate `Session` Locale**: Merge the two duplicated `Session` objects in `apps/mobile/locales/es.json` and `apps/mobile/locales/ca.json` to ensure no keys are lost.
- **Add Missing Keys**: Implement missing keys found in the codebase (e.g., `Common.description`, `Common.location`, `Common.pending`, `Common.workshop`, `Coordination.contact`) in both Catalan and Spanish.
- **Verification**: Ensure that interpolation variables like `{{name}}` and `{{label}}` are correctly defined in the JSON files to prevent raw placeholders from appearing.
- **Cleanup**: Remove any test-related keys that might have leaked into the production locale files from automated extraction.

## Capabilities

### New Capabilities
- `mobile-i18n-maintenance`: Defines the maintenance and verification procedure for mobile internationalization files.

### Modified Capabilities
- `mobile`: The mobile application specification is updated to include localization integrity as a requirement.

## Impact

- **Affected Files**: `apps/mobile/locales/es.json`, `apps/mobile/locales/ca.json`.
- **System**: Enhances the UI consistency and professional appearance of the Mobile App dashboard and session management screens.
