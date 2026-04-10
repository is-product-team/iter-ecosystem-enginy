## Why

The current platform contains multiple inconsistent loading implementations, ranging from raw SVG spinners in pages to custom-built `animate-spin` divs. Recently, a new "Apple-style" core `Loading` component was introduced to provide a more professional, minimalist UX using backdrop blur and refined animations. To achieve 100% aesthetic consistency and avoid the "buggy" look of legacy spinners, we must unify all loading states under this new system.

## What Changes

We will audit the entire `apps/web` directory for any manual usages of `animate-spin`, `border-t-transparent`, or custom spinner logic and replace them with the standardized `<Loading />` component. This includes:
- Updating core components like `Checklist` and `SyncCalendarModal`.
- Updating feature pages such as `Reports`, `Phases`, `Verifications`, and `Questionnaires`.
- Ensuring that the new `size="mini"` and `size="sm"` variants are used correctly in nested layouts and buttons.

## Capabilities

### Modified Capabilities
- `platform-ui`: The global design system for loading indicators is being updated to use a unified, glassmorphism-based component.

## Impact

- **Affected Components**: `Checklist.tsx`, `SyncCalendarModal.tsx`, `Loading.tsx` (already updated, will be verified).
- **Affected Pages**: All pages in `apps/web/app/[locale]` that handle asynchronous data fetching manually.
- **Dependencies**: No new dependencies, uses existing Tailwind/CSS infrastructure.
