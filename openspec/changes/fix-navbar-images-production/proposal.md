## Why

Images in the navigation menu (navbar) are not displaying correctly in the production environment. This is caused by using hardcoded string paths (`/logo.png`) which are unreliable in Next.js production builds, especially when image optimization or custom path prefixes are involved.

## What Changes

- Refactor `apps/web/components/Navbar.tsx` to use static image imports instead of hardcoded string paths.
- Update the `src` attribute of `Image` components to use the imported static assets.
- Ensure both light (`logo.png`) and dark (`logo-invers.png`) versions of the logo are correctly handled via static imports.

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `web`: Standardize image handling in shared web components to ensure production stability.

## Impact

- **Affected Code**: `apps/web/components/Navbar.tsx`
- **Systems**: Web Frontend (Production environment)
- **Dependencies**: None
