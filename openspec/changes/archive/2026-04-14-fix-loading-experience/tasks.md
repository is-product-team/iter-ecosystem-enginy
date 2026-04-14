# Tasks: Fix Loading Experience

- [ ] **Refactor Loading Component**
  - [ ] Update `apps/web/components/Loading.tsx` to remove `animate-spin`.
  - [ ] Implement `tick-fade` keyframe animation in CSS (global or inline).
  - [ ] Apply staggered `animation-delay` to each tick line.
  - [ ] Verify rotation smoothness visually.

- [ ] **Implement Global Loading Transitions**
  - [ ] Create `apps/web/app/[locale]/loading.tsx`.
  - [ ] Export a default component that renders `<Loading fullScreen />`.
  - [ ] Test navigation transitions between un-cached pages.

- [ ] **Verification**
  - [ ] Test on mobile/desktop viewports.
  - [ ] Verify light/dark mode consistency for the spinner.
  - [ ] Ensure "Loading platform..." message appears correctly on initial load.
