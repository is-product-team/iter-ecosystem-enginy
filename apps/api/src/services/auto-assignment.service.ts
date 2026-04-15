import { RequestStatus, AssignmentStatus } from '@prisma/client';
import prisma from '../lib/prisma.js';
import { isPhaseActive } from '../lib/phaseUtils.js';
import { PHASES, REQUEST_STATUSES } from '@iter/shared';
import { SessionService } from './session.service.js';
import { createNotificationInternal } from '../controllers/notification.controller.js';

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
            console.log('ℹ️ AutoAssignmentService: No pending requests found.');
            return { message: 'No se encontraron solicitudes para procesar.' };
        }

        console.log(`🚀 AutoAssignmentService: Processing ${requests.length} requests...`);

        const results = [];

        // 2. Group Requests by Workshop
        const workshopMap = new Map<number, typeof requests>();
        requests.forEach((r) => {
            if (!workshopMap.has(r.workshopId)) {
                workshopMap.set(r.workshopId, []);
            }
            workshopMap.get(r.workshopId)?.push(r);
        });

        // 3. Process each Workshop
        for (const [workshopId, workshopRequests] of workshopMap.entries()) {
            const workshop = await prisma.workshop.findUnique({ where: { workshopId: workshopId } });
            if (!workshop) continue;

            // REAL Capacity Calculation: Count actual enrollments for this workshop across ALL assignments
            const totalEnrollments = (await prisma.enrollment.count({
                where: { assignment: { workshopId: workshopId } }
            })) || 0;

            const remainingCapacity = Math.max(0, workshop.maxPlaces - totalEnrollments);

            console.log(`📊 AutoAssignment: Workshop "${workshop.title}" (ID ${workshopId}): Capacity: ${workshop.maxPlaces}, Occupied (Enrollments): ${totalEnrollments}, Remaining: ${remainingCapacity}`);

            if (remainingCapacity <= 0 || isNaN(remainingCapacity)) {
                console.warn(`🚫 AutoAssignment: Workshop ${workshopId} is full or invalid capacity. Skipping.`);
                continue;
            }

            // Group by Center to handle overall demand per center
            const centerMap = new Map<number, PendingCenter>();

            workshopRequests.forEach((r) => {
                const demand = r.studentsAprox || 0;

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

            // NEW Logic: Maximize workshop capacity usage (filling the workshop)
            // Divide the total remaining capacity among all centers that have at least one request.
            if (centers.length > 0) {
                let leftoverSpots = remainingCapacity;
                const numCenters = centers.length;
                
                // Sort centers by priority (FIFO)
                centers.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

                // Weighted Priority Algorithm (FIFO):
                // Earlier centers get a higher share. Weight formula: 1.0 + (N - 1 - index) * 0.5
                // For 2 centers, this results in a 60/40 ratio (e.g., 12/8 for 20 spots).
                const weights = centers.map((_, i) => 1.0 + (numCenters - 1 - i) * 0.5);
                const totalWeight = weights.reduce((acc, w) => acc + w, 0);

                let allocatedTotal = 0;
                centers.forEach((center, index) => {
                    const share = weights[index] / totalWeight;
                    const distributedShare = Math.floor(share * remainingCapacity);
                    // CAP BY DEMAND: Never give more than requested
                    center.assignedCount = Math.min(center.demand || 0, distributedShare);
                    allocatedTotal += center.assignedCount;
                });

                // Distribute rounding remainder one by one starting from the first center (FIFO)
                // BUT only if they haven't reached their demand yet
                let remainder = remainingCapacity - allocatedTotal;
                if (remainder > 0) {
                    let assignedAny = true;
                    while (remainder > 0 && assignedAny) {
                        assignedAny = false;
                        for (const center of centers) {
                            if (remainder > 0 && center.assignedCount < (center.demand || 0)) {
                                center.assignedCount++;
                                remainder--;
                                assignedAny = true;
                            }
                        }
                    }
                }
                
                console.log(`⚖️ AutoAssignment: Distributed ${remainingCapacity} spots among ${numCenters} centers.`);
            }

            // 4. Create Assignments with Rational Splitting
            for (const center of centers) {
                if (center.assignedCount > 0) {
                    let remainingToAssign = center.assignedCount;
                    let groupNum = 1;
                    const RATIONAL_LIMIT = 25; // Define "Rational" size as 25

                    while (remainingToAssign > 0) {
                        const currentGroupSize = Math.min(remainingToAssign, RATIONAL_LIMIT);
                        
                        // Pass currentGroupSize to help logic if needed, but primarily split assignments
                        await this.persistAssignment(center, workshopId, groupNum);
                        
                        remainingToAssign -= currentGroupSize;
                        groupNum++;
                    }
                    results.push(center);
                }
            }
        }

        return { assignmentsCreated: results.length };
    }

    private async persistAssignment(center: PendingCenter, workshopId: number, groupNum: number = 1) {
        // Only update request to APPROVED on the first group
        if (groupNum === 1) {
            await prisma.request.update({
                where: { requestId: center.requestId },
                data: { 
                    status: REQUEST_STATUSES.APPROVED as RequestStatus,
                    studentsAprox: center.assignedCount
                }
            });

            // Trigger notification
            const workshop = await prisma.workshop.findUnique({ where: { workshopId } });
            await createNotificationInternal({
                centerId: center.centerId,
                title: 'workshop_assigned_title',
                message: JSON.stringify({
                    key: 'workshop_assigned_msg',
                    params: { title: workshop?.title || 'Taller' }
                }),
                type: 'REQUEST',
                importance: 'INFO'
            });
        }

        // Get default startDate from Phase 3 if not provided
        const { phase } = await isPhaseActive(PHASES.EXECUTION);
        const startDate = phase?.startDate || new Date();

        const assignment = await prisma.assignment.create({
            data: {
                requestId: groupNum === 1 ? center.requestId : null, // Unique constraint: only first group linked to request ID
                centerId: center.centerId,
                workshopId: workshopId,
                group: groupNum,
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
