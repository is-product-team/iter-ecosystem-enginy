# Design: Web Optimization and Phase Testing

## 1. Web Application Optimization (Next.js)
To reduce the initial page load time, we will tackle the main bottlenecks generally found in React/Next.js architectures:
### Code Splitting & Dynamic Imports
Large modules such as custom `DatePickers`, `Charts`, or heavy Modals should not be loaded on the initial render. 
- Implement `next/dynamic` to dynamically import components that are not immediately visible.

### Image Optimization
- Ensure all static assets utilize the standard Next.js `<Image />` component with correct `priority` properties on above-the-fold assets (e.g. Iter Logo in the Login View).

### Fonts and Bundling
- Utilize Next.js Font Optimization instead of network requests if not already doing so.
- Audit React components for unnecessary re-renders. Check the `loading.tsx` implementations.

## 2. API Integration Testing Suites
Ensure that all Phases transition without errors using automated environments.
We will set up `vitest` tests within `apps/api`:
- **Phase 1-2 (Preparation and Alignment):** Test workshop generation and validation endpoint connectivity.
- **Phase 3 (Attendance):** Validate that session tracking endpoints behave securely.
- **Phase 4 (Evaluations):** Ensure `closeAssignment` fails without required parameters and properly seals closed workshops while generating completion Certificates.
