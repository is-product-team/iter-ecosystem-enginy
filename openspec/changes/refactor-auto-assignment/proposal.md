# Proposal: Refactor Auto-Assignment Algorithm

## Goal
Optimize the automatic assignment engine to maximize workshop occupancy and ensure a fair distribution of places among requesting centers, respecting priority by request order (FIFO).

## Background
The current `AutoAssignmentService` depends strictly on the `studentsAprox` field in the `Request` table. If this field is zero or null, the request is skipped. Furthermore, if a center requests fewer students than the available capacity, the workshop remains under-occupied even if no other center is asking. 

The user wants the algorithm to "fill" the workshop by dividing its total capacity among the centers that have expressed interest (via a `Request`), rather than just fulfilling the approximate student count.

## Scope
-   **Backend**: Modify `AutoAssignmentService.js/ts` to change the demand calculation and the distribution loop.
-   **Logic**: 
    1.  Assume `demand` is the total remaining capacity if there are requests.
    2.  Equally divide the capacity among all centers with open requests for that workshop.
    3.  Distribute any remainder (the "pico") to the center that requested first (FIFO).
    
Out of scope: Modifying the `AssignmentSolver.ts` or student-level enrollment (this remains Phase 2).

## Expected Outcomes
-   Workshops are filled to their maximum capacity whenever there is at least one request.
-   Fair and transparent distribution between multiple centers.
-   Resolution of the "no assignment" issue when `studentsAprox` is not specified.
