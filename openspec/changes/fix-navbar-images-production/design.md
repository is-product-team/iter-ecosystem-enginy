## Context

The current `Navbar.tsx` component in `apps/web` uses string literals for image paths (e.g., `src="/logo.png"`). In Next.js, this approach relies on the `public/` folder being served at the root, which can fail in production environments depending on base paths, CDN configurations, or image optimization settings.

The `login/page.tsx` was already fixed using static imports, which resolved similar issues.

## Goals / Non-Goals

**Goals:**
- Ensure the Iter logo displays correctly in the Navbar in both light and dark modes in production.
- Standardize on static image imports for core UI assets in the web frontend.

**Non-Goals:**
- Redesigning the Navbar UI.
- Fixing images in the mobile app (already verified as not using images).
- General image optimization across the entire application (scoped only to the Navbar).

## Decisions

### 1. Use Static Imports for Navbar Assets
Instead of `src="/logo.png"`, we will import the image at the top of the file:
```typescript
import logoImg from '@/public/logo.png';
import logoInversImg from '@/public/logo-invers.png';
```
**Rationale**: This allows Next.js to process the asset at build time, giving it a unique hash for caching and ensuring the path is correctly resolved regardless of the deployment environment.

### 2. Retain `next/image` Component
We will continue using the `next/image` component for its performance benefits (Lazy loading, sizing).
**Rationale**: Static imports integrate seamlessly with `next/image`.

## Risks / Trade-offs

- **[Risk] Build size increment** → Mitigation: Minimal. These are small PNG files already present in the repository.
- **[Risk] Path complexity** → Mitigation: Using the `@/public` alias keeps imports clean and maintainable.
