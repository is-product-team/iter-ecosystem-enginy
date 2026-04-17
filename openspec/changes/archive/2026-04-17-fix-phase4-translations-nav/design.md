## Context

The current `Center` dashboard in `apps/web` suffers from missing translation keys and a misaligned Phase 4 navigation. The logic for closing workshops is currently accessible only via the Monitoring page, but the Dashboard's Phase 4 card points to the general assignments list. Furthermore, the Monitoring page lacks a clear separation between active workshops and those awaiting final closure/certification.

## Goals / Non-Goals

**Goals:**
- Eliminate all `MISSING_MESSAGE` console errors related to the `Center` namespace.
- Synchronize the Phase 4 entry point with the actual closure interface.
- Implement a tabbed UX in `MonitoringPage.tsx` for better lifecycle visibility.
- Ensure all 4 supported locales (es, en, ca, ar) are consistently updated.

**Non-Goals:**
- Modifying backend closure logic or database schemas.
- Changing the mobile app's translation structure (out of scope for this web-focused fix).
- Adding new administrative features beyond navigation and display.

## Decisions

### 1. Translation Schema Refactoring
The `Center` object in `messages/*.json` will be extended to include `Closure` and missing `Monitoring` fields.

**Rationale:** Currently, `Closure` exists at the root or under `Admin`, but the `Center` dashboard uses `useTranslations('Center')`. Moving/duplicating these keys into `Center` ensures type safety and prevents runtime errors.

### 2. Tabbed Monitoring Interface
`MonitoringPage.tsx` will be updated to support a `tab` URL parameter.

```ascii
+--------------------------------------------------+
| Monitoring Dashboard                             |
+--------------------------------------------------+
| [ Active Workshops ] | [ Completed / Phase 4 ]   | <--- New Tab Bar
+----------------------+---------------------------+
|                                                  |
|  - Workshop A (In Progress)                      |
|  - Workshop B (Ready)                            |
|                                                  |
+--------------------------------------------------+
```

**Decision:** Use `useSearchParams` from `next/navigation` to persist the tab state. 
- **Alternative:** Local state only. **Rejected** because direct navigation from the Dashboard to the "Completed" tab is required for a seamless Phase 4 experience.

### 3. Dashboard Navigation Update
The Phase 4 card in `app/[locale]/center/page.tsx` will be updated:
- **Path:** `/${locale}/center/assignments` -> `/${locale}/center/monitoring?tab=completed`

## Risks / Trade-offs

- **[Risk]** Overwriting translation keys in other locales. → **Mitigation**: Systematic check of all 4 JSON files using a reference structure.
- **[Risk]** Inconsistent naming between `Center.Monitoring` and `Center.Closure`. → **Mitigation**: Use `Monitoring.description` for consistency with `Assignments.description`.
