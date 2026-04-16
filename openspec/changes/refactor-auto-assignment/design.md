# Design: Refactor Auto-Assignment Algorithm

## Technical Approach
The core logic resides in `apps/api/src/services/auto-assignment.service.ts`. We need to redefine how `demand` is calculated for each center and how the `remainingCapacity` is allocated.

### Current Logic
1.  Iterates through workshops with pending requests.
2.  Groups requests by center, summing up `studentsAprox` as `demand`.
3.  If `totalDemand <= remainingCapacity`, grants `demand`.
4.  If `totalDemand > remainingCapacity`, distributes `remainingCapacity` among centers proportionally (FIFO).

### New Logic
1.  **Iterate through workshops**: Calculate `remainingCapacity` (as before).
2.  **Filter requests**: Do not skip requests with 0 or null `studentsAprox`.
3.  **Calculate distribution**:
    -   If there is at least one request, we aim to allocate exactly `remainingCapacity` across all requesting centers.
    -   A center's "fair share" is `Math.floor(remainingCapacity / numCenters)`.
    -   The `remainder` (modulus) is allocated to the first $N$ centers sorted by `timestamp` (FIFO).
4.  **Edge cases**:
    -   If `remainingCapacity <= 0`, skip.
    -   If no requests, skip.

## Data Structures
We will use the same `PendingCenter` interface but we will simplify the `assignedCount` calculation:

```typescript
// Proposed algorithm snippet
let leftoverSpots = remainingCapacity;
const numCenters = centers.length;
const baseShare = Math.floor(leftoverSpots / numCenters);
leftoverSpots %= numCenters;

centers.forEach((center, index) => {
    center.assignedCount = baseShare + (index < leftoverSpots ? 1 : 0);
});
```

## Considerations
-   **Workshop Capacity**: We must ensure `totalEnrollments` is up to date before calculating `remainingCapacity`.
-   **Request Status**: Only `PENDING` or `APPROVED` requests are considered.
-   **Modality C**: Although the comment mentions Modality C, the current code doesn't filter for it. We will keep it that way unless otherwise requested.
