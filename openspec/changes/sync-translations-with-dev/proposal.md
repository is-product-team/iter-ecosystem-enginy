## Why

The current `feature/traduccion` branch is in a severe merge conflict state with `dev`. This is because `feature/traduccion` implemented a `next-intl` structure using Catalan names (`[locale]/centro`), while `dev` underwent a major refactor to English names (`center`) but remained at the top level. 

To ensure long-term maintainability and take advantage of the latest features in `dev` (like the AI validator), we need to synchronize these two structural changes by adopting the English naming within the internationalized structure.

## What Changes

1. **Conflict Resolution**: Abort the current messy merge and reset the branch to `origin/dev` to inherit the new English naming and latest features.
2. **Infrastructure Restoration**: Re-apply the `next-intl` configuration (middleware, request config) from previous work.
3. **Route Migration**: Move all English-named routes (admin, center, login, perfil) into the `[locale]` segment.
4. **Translation Update**: Update translation dictionaries (`messages/ca.json`, `messages/es.json`) to use English keys matching the new route structure.

## Capabilities

### New Capabilities
- `synchronized-i18n`: Unified routing structure using `next-intl` with English-friendly path segments under the `[locale]` parameter.

### Modified Capabilities
- `apps-web-routing`: Requirement changes from flat routing to internationalized segment-based routing.

## Impact

- **Frontend (Web)**: All files in `apps/web/app/` will be moved to `apps/web/app/[locale]/`.
- **Middleware**: `apps/web/middleware.ts` will now intercept and redirect based on locale.
- **Routing**: Links within the application will need to be checked for locale awareness (though `next-intl` handles much of this).
- **Build System**: The `apps/web` build process will be validated for the new structure.
