import { RequestStatus, AssignmentStatus } from '@prisma/client';
import prisma from '../lib/prisma.js';
import { isPhaseActive } from '../lib/phaseUtils.js';
import { PHASES, REQUEST_STATUSES } from '@iter/shared';
import { SessionService } from './session.service.js';

interface PendingCenter {
    centerId: number;
    students: number[];
    requestId: number;
    timestamp: Date;
    assignedCount: number;
    demand?: number;
}

export class AutoAssignmentService {

    constructor() { }

    /**
     * Generates assignments using a Fair Distribution algorithm.
     * Rule: If demand > supply, split evenly among centers. Remainder goes by priority.
     */
    async generateAssignments() {
        // 1. Fetch Approved/Pending Requests for Modality C that are not yet fully assigned
        const requests = await prisma.request.findMany({
            where: {
                status: { in: [REQUEST_STATUSES.APPROVED, REQUEST_STATUSES.PENDING] as RequestStatus[] },
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

        if (requests.length === 0) {
            console.log('ℹ️ AutoAssignmentService: No approved requests of Modality C found that are not yet assigned.');
            return { message: 'No requests found to process.' };
        }

        console.log(`🚀 AutoAssignmentService: Processing ${requests.length} requests...`);

        // 2. Group Requests by Workshop
        const workshopMap = new Map<number, typeof requests>();
        requests.forEach((r) => {
            if (!workshopMap.has(r.workshopId)) {
                workshopMap.set(r.workshopId, []);
            }
            workshopMap.get(r.workshopId)?.push(r);
        });

        const results = [];

        // 3. Process each Workshop
        for (const [workshopId, workshopRequests] of workshopMap.entries()) {
            const workshop = await prisma.workshop.findUnique({ where: { workshopId: workshopId } });
            if (!workshop) continue;

            // Calculate Capacity
            const existingAssignments = await prisma.assignment.findMany({
                where: { workshopId: workshopId },
                include: { enrollments: true }
            });

            const occupiedPlaces = existingAssignments.reduce((sum: number, a: any) => sum + (a.enrollments?.length || 0), 0);
            const remainingCapacity = workshop.maxPlaces - occupiedPlaces;

            console.log(`📊 AutoAssignment: Workshop ID ${workshopId} (${workshop.title}): Capacity: ${workshop.maxPlaces}, Occupied: ${occupiedPlaces}, Remaining: ${remainingCapacity}`);

            if (remainingCapacity <= 0) {
                console.warn(`🚫 AutoAssignment: Workshop ${workshopId} is full. Skipping.`);
                continue;
            }

            // Group by Center
            const centerMap = new Map<number, PendingCenter>();

            workshopRequests.forEach((r) => {
                const demand = r.studentsAprox || 0;
                if (demand === 0) return;

                if (!centerMap.has(r.centerId)) {
                    centerMap.set(r.centerId, {
                        centerId: r.centerId,
                        students: [], 
                        requestId: r.requestId,
                        timestamp: r.createdAt,
                        assignedCount: 0,
                        demand: 0
                    });
                }
                const entry = centerMap.get(r.centerId)!;
                entry.demand = (entry.demand || 0) + demand; 

                if (r.createdAt < entry.timestamp) {
                    entry.timestamp = r.createdAt;
                }
            });

            const centers = Array.from(centerMap.values());
            const totalDemand = centers.reduce((sum: number, c) => sum + (c.demand || 0), 0);

            if (totalDemand <= remainingCapacity) {
                centers.forEach((c) => c.assignedCount = c.demand || 0);
            } else {
                const numCenters = centers.length;
                const baseShare = Math.floor(remainingCapacity / numCenters);

                let leftoverSpots = remainingCapacity;

                centers.forEach((c) => {
                    const allocation = Math.min(c.demand || 0, baseShare);
                    c.assignedCount = allocation;
                    leftoverSpots -= allocation;
                });

                centers.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

                let i = 0;
                while (leftoverSpots > 0) {
                    const center = centers[i % numCenters];
                    if (center.assignedCount < (center.demand || 0)) {
                        center.assignedCount++;
                        leftoverSpots--;
                    }
                    i++;
                    if (i >= numCenters * 2 && leftoverSpots > 0) break;
                }
            }

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
        await prisma.request.update({
            where: { requestId: center.requestId },
            data: { status: REQUEST_STATUSES.APPROVED as RequestStatus }
        });

        // Get default startDate from Phase 3 if not provided
        const { phase } = await isPhaseActive(PHASES.EXECUTION);
        const startDate = phase?.startDate || new Date();

        const assignment = await prisma.assignment.create({
            data: {
                requestId: center.requestId,
                centerId: center.centerId,
                workshopId: workshopId,
                status: AssignmentStatus.PUBLISHED,
                startDate: startDate,
                checklist: {
                    create: [
                        { stepName: 'Assign Reference Teachers', isCompleted: false },
                        { stepName: 'Nominal Register (Excel)', isCompleted: false },
                        { stepName: 'Pedagogical Agreement', isCompleted: false }
                    ]
                }
            }
        });

        // Use SessionService for robust session generation
        await SessionService.syncSessionsForAssignment(assignment.assignmentId);

        console.log(`✅ AutoAssignment: Assigned ${center.assignedCount} students to Center ${center.centerId} for Workshop ${workshopId}`);
    }
}
