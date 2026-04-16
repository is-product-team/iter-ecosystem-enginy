## 1. Backend: Service Re-routing

- [x] 1.1 Update `tetris.controller.ts` to instantiate `AutoAssignmentService`
- [x] 1.2 Replace call to `tetrisService.processVacancies()` with `autoAssignmentService.generateAssignments()`
- [x] 1.3 Update `AutoAssignmentService.generateAssignments` return structure to use `{ assignmentsCreated: number }` instead of `{ processed: number }`

## 2. Frontend: Verification

- [x] 2.1 Confirm `AdminRequestsPage.tsx` correctly displays the count from `assignmentsCreated` in the success toast
- [x] 2.2 Verify that the "Tetris" button correctly triggers the new generative logic in a development environment

## 3. Validation

- [x] 3.1 Perform a complete end-to-end test: Create pending requests -> Run auto-assignment -> Verify assignments appear and requests are approved
