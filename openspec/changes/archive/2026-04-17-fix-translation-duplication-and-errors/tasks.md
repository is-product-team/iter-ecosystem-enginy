## 1. Research & Analysis

- [x] 1.1 Perform a complete search for `"Monitoring":` in all `apps/web/messages/*.json` files to identify all duplicate instances
- [x] 1.2 Compare keys between `ca.json` (source of truth) and `es.json`, `en.json`, `ar.json`

## 2. Localization Cleanup

- [x] 2.1 Consolidate all Monitoring keys into `Center.Monitoring` in `es.json` and remove duplicates
- [x] 2.2 Consolidate all Monitoring keys into `Center.Monitoring` in `en.json` and remove duplicates
- [x] 2.3 Consolidate all Monitoring keys into `Center.Monitoring` in `ar.json` and remove duplicates
- [x] 2.4 Synchronize missing `Closure` and `Monitoring` metadata across all locales to match `ca.json`

## 3. Validation

- [x] 3.1 Start the web development server and navigate to the Coordinator Dashboard in all 4 languages
- [x] 3.2 Verify that no `MISSING_MESSAGE` console errors are reported for the Monitoring or Closure modules
