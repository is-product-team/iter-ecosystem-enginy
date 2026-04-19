## 1. Translation Synchronization

- [x] 1.1 Add missing `Monitoring` and `Closure` keys to `apps/web/messages/es.json`
- [x] 1.2 Add missing `Monitoring` and `Closure` keys to `apps/web/messages/en.json`
- [x] 1.3 Add missing `Monitoring` and `Closure` keys to `apps/web/messages/ca.json`
- [x] 1.4 Add missing `Monitoring` and `Closure` keys to `apps/web/messages/ar.json`
- [x] 1.5 Verify that the 12 console errors have disappeared from the Coordinator Dashboard

## 2. Monitoring Page Refactor

- [x] 2.1 Update `MonitoringPage.tsx` to include `useSearchParams` for tab state
- [x] 2.2 Implement the tabbed UI for "Active" and "Completed" workshops
- [x] 2.3 Filter assignments based on the active tab (In Progress vs Completed)
- [x] 2.4 Update `CloseWorkshopSection` to use the standardized `Center.Monitoring` translation namespace

## 3. Dashboard Navigation & Verification

- [x] 3.1 Update the Phase 4 card path in `apps/web/app/[locale]/center/page.tsx` to use the new tabbed URL
- [x] 3.2 Perform a manual smoke test of the end-to-end Phase 4 flow
- [x] 3.3 Ensure all status indicators in the new "Completed" tab are accurate
