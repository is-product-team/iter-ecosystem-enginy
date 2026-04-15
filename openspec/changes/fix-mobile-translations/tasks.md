## 1. Locale Consolidation

- [x] 1.1 Unify duplicated `Session` objects in `apps/mobile/locales/es.json`.
- [x] 1.2 Unify duplicated `Session` objects in `apps/mobile/locales/ca.json`.
- [x] 1.3 Add missing `Common` keys (`description`, `location`, `pending`, `workshop`) to both files.
- [x] 1.4 Add missing `Coordination.contact` key to both files.
- [x] 1.5 Ensure `Dashboard.greeting_morning` and `greeting_afternoon` use correctly formatted `{{name}}` interpolation.

## 2. Validation & Cleanup

- [x] 2.1 Remove non-essential test keys from the locale files.
- [x] 2.2 Run the `check_translations.js` script to verify no used keys are missing.
- [x] 2.3 Verify the Dashboard and Session screens in the app (manual check if possible, or code review of usage).
