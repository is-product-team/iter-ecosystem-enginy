import { REQUEST_STATUSES } from '@iter/shared';
import { RequestStatus } from '@prisma/client';

interface PendingCenter {
    centerId: number;
    students: number[];
    requestId: number;
    timestamp: Date;
    assignedCount: number;
}

export class AutoAssignmentService {

    constructor() { }

    /**
     * Generates assignments using a Fair Distribution algorithm.
     * Rule: If demand > supply, split evenly among centers. Remainder goes by priority.
     */
    async generateAssignments() {
        // 1. Fetch Approved/Pending Petitions for Modalitat C that are not yet fully assigned
        const petitions = await prisma.request.findMany({
            where: {
                status: { in: [REQUEST_STATUSES.APPROVED, REQUEST_STATUSES.PENDING] },
                modality: 'C',
                assignment: null
            },
            include: {
                center: true,
                workshop: true
            },
            orderBy: {
                createdAt: 'asc'
            }
        });

        if (petitions.length === 0) {
            console.log('ℹ️ AutoAssignmentService: No approved petitions of Modalitat C found that are not yet assigned.');
            return { message: 'No petitions found to process.' };
        }

        console.log(`🚀 AutoAssignmentService: Processing ${petitions.length} petitions of Modalitat C...`);

        // 2. Group Petitions by Workshop
        const workshopMap = new Map<number, typeof petitions>();
        petitions.forEach((p: any) => {
            if (!workshopMap.has(p.id_workshop)) {
                workshopMap.set(p.id_workshop, []);
            }
            workshopMap.get(p.id_workshop)?.push(p);
        });

        const results = [];

        // 3. Process each Workshop
        for (const [workshopId, workshopPetitions] of workshopMap.entries()) {
            const workshop = await prisma.workshop.findUnique({ where: { id_workshop: workshopId } });
            if (!workshop) continue;

            // Calculate Capacity
            const existingAssignments = await prisma.assignment.findMany({
                where: { id_workshop: workshopId },
                include: { enrollments: true }
            });

            const occupiedPlazas = existingAssignments.reduce((sum: number, a: any) => sum + a.enrollments.length, 0);
            const remainingCapacity = workshop.maxPlaces - occupiedPlazas;

            console.log(`📊 AutoAssignment: Workshop ID ${workshopId} (${workshop.title}): Capacity: ${workshop.maxPlaces}, Occupied: ${occupiedPlazas}, Remaining: ${remainingCapacity}`);

            if (remainingCapacity <= 0) {
                console.warn(`🚫 AutoAssignment: Workshop ${workshopId} is full. Skipping.`);
                continue;
            }

            // Group by Center
            const centersData: PendingCenter[] = [];

            // Map to aggregate students if a center has multiple petitions for same workshop (rare but possible)
            // or just treat each petition as a distinct entry? 
            // The requirement implies "Fairness between Centers", so we should aggregate by Center.
            const centerMap = new Map<number, PendingCenter>();

            workshopPetitions.forEach((p: any) => {
                const demand = p.studentsAprox || 0;
                if (demand === 0) return;

                if (!centerMap.has(p.id_center)) {
                    centerMap.set(p.id_center, {
                        centerId: p.id_center,
                        students: [], // No actual students yet
                        requestId: p.id_request,
                        timestamp: p.createdAt,
                        assignedCount: 0
                    });
                }
                const entry = centerMap.get(p.id_center)!;
                entry.assignedCount += demand; // Store initial demand here for calc

                if (p.createdAt < entry.timestamp) {
                    entry.timestamp = p.createdAt;
                }
            });

            // Adjust assignedCount back for calculation
            centersData.push(...Array.from(centerMap.values()).map(c => {
                const demand = c.assignedCount;
                c.assignedCount = 0; // reset for distribution
                return { ...c, demand };
            }));

            const centers = centersData as any[];
            const totalDemand = centers.reduce((sum: number, c: any) => sum + c.demand, 0);

            // DISTRIBUTION LOGIC
            // let allocated = 0; // Removed as unused

            if (totalDemand <= remainingCapacity) {
                // Happy Path: Give everyone everything
                centers.forEach((c: any) => c.assignedCount = c.students.length);
                // allocated = totalDemand; // Removed as unused
            } else {
                // Scarcity Logic: Fair Share
                const numCenters = centers.length;
                const baseShare = Math.floor(remainingCapacity / numCenters);

                // 1. Base Allocation
                let leftoverSpots = remainingCapacity;

                centers.forEach((c: any) => {
                    const allocation = Math.min(c.demand, baseShare);
                    c.assignedCount = allocation;
                    leftoverSpots -= allocation;
                });

                // 2. Distribute Leftovers by Priority (Earliest Timestamp)
                centers.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

                let i = 0;
                while (leftoverSpots > 0) {
                    const center = centers[i % numCenters];
                    if (center.assignedCount < center.demand) {
                        center.assignedCount++;
                        leftoverSpots--;
                    }
                    i++;
                    if (i >= numCenters * 2 && leftoverSpots > 0) break;
                }
            }

            // SAVE TO DB
            for (const center of centers) {
                if (center.assignedCount > 0) {
                    await this.persistAssignment(center, workshopId);
                    results.push(center);
                }
            }
        }

        return { processed: results.length };
    }

    private async persistAssignment(center: PendingCenter, workshopId: number) {
        // Take the first N students
        // center.students.slice(0, center.assignedCount); // Removed as unused

        // Update Petition Status
        await prisma.request.update({
            where: { id_request: center.requestId },
            data: { status: REQUEST_STATUSES.APPROVED }
        });

        // Create Assignment
        const assignacio = await prisma.assignment.create({
            data: {
                id_request: center.requestId,
                id_center: center.centerId,
                id_workshop: workshopId,
                status: 'PUBLISHED',
                checklist: {
                    create: [
                        { stepName: 'Designar Profesores Referentes', isCompleted: false },
                        { stepName: 'Subir Registro Nominal (Excel)', isCompleted: true },
                        { stepName: 'Acuerdo Pedagógico (Modalidad C)', isCompleted: false }
                    ]
                }
            }
        });

        // Note: Specific enrollments are created later by the center.
        // For now we just create the Assignment framework.

        // Generate Sessions (Copy from original)
        const workshop = await prisma.workshop.findUnique({ where: { id_workshop: workshopId } });
        if (workshop && workshop.executionDays) {
            const schedule = workshop.executionDays as any[];
            if (Array.isArray(schedule) && schedule.length > 0) {
                const sessionsData = schedule.map(slot => {
                    const d = new Date();
                    d.setDate(d.getDate() + 1);
                    while (d.getDay() !== slot.dayOfWeek) {
                        d.setDate(d.getDate() + 1);
                    }
                    return {
                        id_assignment: assignacio.id_assignment,
                        sessionDate: d,
                        hora_inici: (slot as any).startTime,
                        hora_fi: (slot as any).endTime
                    };
                });
            }
        }

        console.log(`✅ AutoAssignment: Assigned ${center.assignedCount} students to Center ${center.centerId} for Workshop ${workshopId}`);
    }
}
