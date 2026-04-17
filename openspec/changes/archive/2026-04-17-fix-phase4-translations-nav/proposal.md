## Why

The Iter Ecosystem currently reports 12 console errors due to missing translation keys in the `Center` namespace across all locales (es, en, ca, ar). Additionally, the Phase 4 (Closure) navigation in the Coordinator Dashboard is misaligned, redirecting to the general assignments list instead of the specific closure and certification interface. This creates friction in the final stage of the workshop lifecycle.

## What Changes

- **Translation Synchronization**: Injection of missing keys (`Monitoring.description`, `Closure.title`, `Closure.description`, `no_assignments`) in `apps/web/messages/*.json` for all supported languages.
- **Phase 4 Navigation Correction**: Update the Coordinator Dashboard to redirect Phase 4 actions to the Monitoring page with a specific tab focus.
- **UX Enhancement**: Implementation of a tabbed interface in the Monitoring page to clearly separate "Active Workshops" from "Completed Workshops (Phase 4)".
- **Namespace Harmonization**: Alignment of `CloseWorkshopSection` to use the `Center.Monitoring` translation namespace instead of `AssignmentWorkshopsPage` where appropriate.

## Capabilities

### New Capabilities
- `phase4-visibility`: Unified view for completed workshops, allowing coordinators to access final results and download certificates directly from a dedicated "Completed" tab.

### Modified Capabilities
- `mobile/translations-centralization`: Extending the synchronization logic to ensure web translations for core center operations are complete and consistent.
- `closure-orchestration`: Refining the entry point and visibility of the closure process for center coordinators.

## Impact

- **Affected Code**: `apps/web/app/[locale]/center/page.tsx`, `apps/web/app/[locale]/center/monitoring/page.tsx`, `apps/web/messages/*.json`.
- **UI/UX**: Improved console hygiene (zero errors) and more intuitive access to Phase 4 features.
- **Systems**: No backend changes required; this is a frontend/localization alignment.
