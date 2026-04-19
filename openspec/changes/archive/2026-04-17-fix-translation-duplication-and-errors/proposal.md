## Why

The system currently reports multiple `MISSING_MESSAGE` console errors (specifically `Center.Monitoring.description`) across all locales (es, ca, en, ar). This is caused by a structural duplication in the localization JSON files where a second, incomplete `"Monitoring"` object (located within `AssignmentWorkshopsPage` or incorrectly nested) overrides the complete definition in the `Center` namespace.

## What Changes

- **Localization Cleanup**: Unify all `"Monitoring"` translation keys into a single, comprehensive object within the `Center` namespace for all supported locales.
- **Deduplication**: Remove redundant or incomplete `"Monitoring"` objects found in deeper namespaces (specifically in `AssignmentWorkshopsPage` or similar).
- **Locale Synchronization**: Ensure that `es.json`, `en.json`, and `ar.json` have the exact same structure and required keys as the reference `ca.json`.

## Capabilities

### New Capabilities
- `localization-hygiene`: A unified structure for center monitoring and closure translations, ensuring zero console errors and consistent messaging across all supported languages.

### Modified Capabilities
- `web`: Updating the core translation requirements for the coordinator dashboard to ensure all metadata keys for monitoring and closure are present and correctly nested.

## Impact

- **Affected Code**: `apps/web/messages/*.json` (ca, es, en, ar).
- **UI/UX**: Elimination of console noise and improved reliability of translation resolution for the Coordinator Dashboard.
- **Systems**: No impact on API or mobile app; strictly a web/localization alignment.
