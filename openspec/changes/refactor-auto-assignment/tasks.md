# Tasks: Refactor Auto-Assignment Algorithm

- [ ] Modify `AutoAssignmentService.ts` to include requests with zero/null `studentsAprox`
- [ ] Refactor the demand-based distribution logic into a "Fill Capacity" logic
- [ ] Implement fair division with FIFO priority for the remainder
- [ ] Ensure `persistAssignment` handles the new `assignedCount` correctly
- [ ] Verify the algorithm with multiple test cases:
    - [ ] Case 1: 1 center, 20 places -> 20 assigned
    - [ ] Case 2: 2 centers, 20 places -> 10 each
    - [ ] Case 3: 3 centers, 20 places -> 7, 7, 6 (based on timestamp)
- [ ] Manual verification via Admin Dashboard
