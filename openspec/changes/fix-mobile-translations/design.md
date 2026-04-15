## Context

The current `i18next` implementation in the mobile application relies on two main JSON files: `es.json` and `ca.json`. Both files have a structural error: the `Session` key is defined twice. In JSON, the last occurrence of a key overwrites the previous ones. This has caused the first `Session` block (containing `title`, `attendance_instruction`, etc.) to be partially or completely lost when the second block (containing `title_attendance`, `title_work`, etc.) was added. Additionally, several UI components reference keys in `Common` and `Coordination` that are not present in the locale files.

## Goals / Non-Goals

**Goals:**
- **Structural Integrity**: Merge all `Session` related keys into a single, unified object per file.
- **Completeness**: Add all missing keys that are currently being rendered as literal keys in the UI.
- **Consistency**: Synchronize both `es.json` and `ca.json` to have the exact same set of keys.
- **Variable Correction**: Ensure interpolation placeholders (e.g., `{{name}}`) match the expected `i18next` syntax.

**Non-Goals:**
- **Automated i18n Tooling**: Implementing a full automated extraction pipeline (like `i18next-scanner`) is out of scope for this surgical fix.
- **Web App Localization**: This change is strictly limited to the `apps/mobile` directory.

## Decisions

- **Single Object Consolidation**: The `Session` block will be unified. Instead of `title` vs `title_attendance`, we will keep both as distinct keys within the same `Session` object if they are both used. Research shows `title` is used in some components and `title_attendance` in others.
- **Manual Synchronization**: A manual audit will be performed to ensure both files are identical in structure.

## Risks / Trade-offs

- **[Risk] Incorrect Interpolation** → [Mitigation] Verify key names in `(professor)/(tabs)/index.tsx` (e.g., `greeting_morning`) and confirm they match the JSON.
- **[Risk] Missing Translations** → [Mitigation] Use the `check_translations.js` script (previously used in research) as a final validation step before completion.
