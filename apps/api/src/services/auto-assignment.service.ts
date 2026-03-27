import { REQUEST_STATUSES } from '@iter/shared';
import { RequestStatus } from '@prisma/client';

interface PendingCenter {
    centerId: number;
    students: number[];
    peticioId: number;
    timestamp: Date;
    assignedCount: number;
}

export class AutoAssignmentService {
    
    constructor() {}

    /**
     * Generates assignments using a Fair Distribution algorithm.
     * Rule: If demand > supply, split evenly among centers. Remainder goes by priority.
     */
    async generateAssignments() {
        // 1. Fetch Approved/Pending Petitions for Modalitat C that are not yet fully assigned
        const petitions = await prisma.request.findMany({
            where: {
                status: { in: [RequestStatus.APPROVED, RequestStatus.PENDING] },
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
        for (const [tallerId, workshopPetitions] of workshopMap.entries()) {
            const taller = await prisma.workshop.findUnique({ where: { id_workshop: tallerId } });
            if (!taller) continue;

            // Calculate Capacity
            const existingAssignments = await prisma.assignment.findMany({
                where: { id_workshop: tallerId },
                include: { enrollments: true }
            });

            const occupiedPlazas = existingAssignments.reduce((sum: number, a: any) => sum + a.enrollments.length, 0);
            const remainingCapacity = taller.maxPlaces - occupiedPlazas;

            console.log(`📊 AutoAssignment: Workshop ID ${tallerId} (${taller.title}): Capacity: ${taller.maxPlaces}, Occupied: ${occupiedPlazas}, Remaining: ${remainingCapacity}`);

            if (remainingCapacity <= 0) {
                console.warn(`🚫 AutoAssignment: Workshop ${tallerId} is full. Skipping.`);
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
                        peticioId: p.id_request, 
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
                    await this.persistAssignment(center, tallerId);
                    results.push(center);
                }
            }
        }

        return { processed: results.length };
    }

    private async persistAssignment(center: PendingCenter, tallerId: number) {
        // Take the first N students
        // center.students.slice(0, center.assignedCount); // Removed as unused

        // Fetch the original petition to get its modality
        const petition = await prisma.request.findUnique({
            where: { id_request: center.peticioId },
            select: { modality: true, studentsAprox: true, status: true }
        });

        if (!petition) {
            console.error(`Error: Petition with ID ${center.peticioId} not found.`);
            return;
        }

        const neededPlazas = petition.studentsAprox || 0;
        
        // 5. Upgrade status if pending
        if (petition.status === RequestStatus.PENDING) {
            await prisma.request.update({
                where: { id_request: center.peticioId },
                data: { status: RequestStatus.APPROVED }
            });
        }

        // Create Assignment
        const assignacio = await prisma.assignment.create({
            data: {
                id_request: center.peticioId,
                id_center: center.centerId,
                id_workshop: tallerId,
                status: 'PUBLISHED',
                checklist: {
                    createMany: {
                        data: [
                            { stepName: 'Designar Professors Referents', isCompleted: false },
                            { stepName: 'Pujar Registre Nominal (Excel)', isCompleted: false },
                            { stepName: 'Gestionar Acord Pedagògic', isCompleted: petition.modality !== 'C' },
                            { stepName: 'Autoritzacions d\'Imatge i Desplaçament', isCompleted: false }
                        ]
                    }
                }
            },
            include: { workshop: true }
        });

        // Note: Specific enrollments are created later by the center.
        // For now we just create the Assignment framework.

        // Generate Sessions
        if (assignacio.workshop && assignacio.workshop.executionDays) {
            const sessionsData = assignacio.workshop.executionDays as any[];
            if (Array.isArray(sessionsData)) {
                await prisma.session.createMany({
                    data: sessionsData.map(slot => ({
                        id_assignment: assignacio.id_assignment,
                        sessionDate: new Date(),
                        startTime: slot.startTime,
                        endTime: slot.endTime
                    }))
                });
            }
        }

        console.log(`✅ AutoAssignment: Assigned ${center.assignedCount} students to Center ${center.centerId} for Workshop ${tallerId}`);
    }
}
