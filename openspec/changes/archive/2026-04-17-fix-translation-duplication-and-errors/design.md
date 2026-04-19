## Context

The `apps/web` application uses `next-intl` for localization. Currently, the `messages/*.json` files contain a structural error where the `"Monitoring"` key is defined multiple times at different nesting levels. Specifically, a definition in `Center.Monitoring` is being shadowed or overridden by an incomplete definition in `AssignmentWorkshopsPage.Monitoring`. This leads to `MISSING_MESSAGE` errors when the Dashboard attempts to render the description for center monitoring.

## Goals / Non-Goals

**Goals:**
- Unify all `"Monitoring"` keys under `Center.Monitoring` in `ca.json`, `es.json`, `en.json`, and `ar.json`.
- Eliminate duplicate `"Monitoring"` definitions in `AssignmentWorkshopsPage`.
- Synchronize all locales to prevent missing keys in `es`, `en`, and `ar`.

**Non-Goals:**
- Adding new translation features or changing the localization library.
- Modifying backend logic or API responses.

## Decisions

### 1. Structural Consolidation
We will adopt the structure found in `ca.json` as the source of truth for `Center.Monitoring` and `Center.Closure`. All other languages will be reconciled to match this nesting.

**Rationale:** `ca.json` currently has the most complete and correctly nested definitions for the Phase 4 and Monitoring modules.

### 2. Elimination of Shadowing
The duplicate `Monitoring` object within `AssignmentWorkshopsPage` will be removed. Any unique keys it contains (like `no_assignments`) will be merged into the primary `Center.Monitoring` object.

**Rationale:** JSON parsers typically keep the last occurrence of a key, and `next-intl` lookups can become ambiguous with duplicate names in deep trees.

### 3. Locales to be updated
All 4 locales (`ca`, `es`, `en`, `ar`) will be processed to ensure global consistency.

## Risks / Trade-offs

- **[Risk]** → Accidental deletion of unique translation keys.
- **Mitigation** → Perform a keys-diff before deleting any object to ensure all strings are preserved in the new consolidated location.

- **[Risk]** → JSON syntax errors after manual editing.
- **Mitigation** → Validate each JSON file with a linting tool or by running the dev server to confirm translations resolve correctly.
