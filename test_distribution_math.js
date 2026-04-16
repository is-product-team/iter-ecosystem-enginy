
function calculateDistribution(numCenters, remainingCapacity) {
    // Mimic the logic in AutoAssignmentService
    const centers = Array.from({ length: numCenters }, (_, i) => ({
        id: i + 1,
        assignedCount: 0
    }));

    const weights = centers.map((_, i) => 1.0 + (numCenters - 1 - i) * 0.5);
    const totalWeight = weights.reduce((acc, w) => acc + w, 0);

    let allocatedTotal = 0;
    centers.forEach((center, index) => {
        const share = weights[index] / totalWeight;
        center.assignedCount = Math.floor(share * remainingCapacity);
        allocatedTotal += center.assignedCount;
    });

    let remainder = remainingCapacity - allocatedTotal;
    let i = 0;
    while (remainder > 0 && numCenters > 0) {
        centers[i % numCenters].assignedCount++;
        remainder--;
        i++;
    }

    return centers.map(c => c.assignedCount);
}

console.log('--- 2 Centers, 20 Spots ---');
console.log(calculateDistribution(2, 20)); // Expected [12, 8]

console.log('--- 3 Centers, 20 Spots ---');
console.log(calculateDistribution(3, 20)); // Expected [9, 7, 4] (my manual calculation was 9, 7, 4)

console.log('--- 12 Centers, 20 Spots ---');
console.log(calculateDistribution(12, 20));

console.log('--- 12 Centers, 50 Spots ---');
console.log(calculateDistribution(12, 50));
