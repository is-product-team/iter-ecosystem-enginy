import { REQUEST_STATUSES } from '@iter/shared';
import { RequestStatus } from '@prisma/client';
import prisma from '../lib/prisma.js';

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
                status: { in: [REQUEST_STATUSES.APPROVED, REQUEST_STATUSES.PENDING] as any },
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
            if (!workshopMap.has(p.workshopId)) {
                workshopMap.set(p.workshopId, []);
            }
            workshopMap.get(p.workshopId)?.push(p);
        });

        const results = [];

        // 3. Process each Workshop
        for (const [workshopId, workshopPetitions] of workshopMap.entries()) {
            const workshop = await prisma.workshop.findUnique({ where: { workshopId: workshopId } });
            if (!workshop) continue;

            // Calculate Capacity
            const existingAssignments = await prisma.assignment.findMany({
                where: { workshopId: workshopId },
                include: { enrollments: true }
            });

            const occupiedPlazas = existingAssignments.reduce((sum: number, a: any) => sum + (a.enrollments?.length || 0), 0);
            const remainingCapacity = workshop.maxPlaces - occupiedPlazas;

            console.log(`📊 AutoAssignment: Workshop ID ${workshopId} (${workshop.title}): Capacity: ${workshop.maxPlaces}, Occupied: ${occupiedPlazas}, Remaining: ${remainingCapacity}`);

            if (remainingCapacity <= 0) {
                console.warn(`🚫 AutoAssignment: Workshop ${workshopId} is full. Skipping.`);
                continue;
            }

            // Group by Center
            const centersData: PendingCenter[] = [];

            const centerMap = new Map<number, PendingCenter>();

            workshopPetitions.forEach((p: any) => {
                const demand = p.studentsAprox || 0;
                if (demand === 0) return;

                if (!centerMap.has(p.centerId)) {
                    centerMap.set(p.centerId, {
                        centerId: p.centerId,
                        students: [], 
                        requestId: p.requestId,
                        timestamp: p.createdAt,
                        assignedCount: 0
                    });
                }
                const entry = centerMap.get(p.centerId)!;
                entry.assignedCount += demand; 

                if (p.createdAt < entry.timestamp) {
                    entry.timestamp = p.createdAt;
                }
            });

            centersData.push(...Array.from(centerMap.values()).map(c => {
                const demand = c.assignedCount;
                c.assignedCount = 0; 
                return { ...c, demand };
            }));

            const centers = centersData as any[];
            const totalDemand = centers.reduce((sum: number, c: any) => sum + c.demand, 0);

            if (totalDemand <= remainingCapacity) {
                centers.forEach((c: any) => c.assignedCount = c.demand);
            } else {
                const numCenters = centers.length;
                const baseShare = Math.floor(remainingCapacity / numCenters);

                let leftoverSpots = remainingCapacity;

                centers.forEach((c: any) => {
                    const allocation = Math.min(c.demand, baseShare);
                    c.assignedCount = allocation;
                    leftoverSpots -= allocation;
                });

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
            data: { status: REQUEST_STATUSES.APPROVED as any }
        });

        const assignment = await prisma.assignment.create({
            data: {
                requestId: center.requestId,
                centerId: center.centerId,
                workshopId: workshopId,
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

        const workshop = await prisma.workshop.findUnique({ where: { workshopId: workshopId } });
        if (workshop && workshop.executionDays) {
            const schedule = workshop.executionDays as any[];
            if (Array.isArray(schedule) && schedule.length > 0) {
                await prisma.session.createMany({
                    data: schedule.map(slot => {
                        const d = new Date();
                        d.setDate(d.getDate() + 1);
                        while (d.getDay() !== slot.dayOfWeek) {
                            d.setDate(d.getDate() + 1);
                        }
                        return {
                            assignmentId: assignment.assignmentId,
                            sessionDate: d,
                            startTime: (slot as any).startTime,
                            endTime: (slot as any).endTime
                        };
                    })
                });
            }
        }

        console.log(`✅ AutoAssignment: Assigned ${center.assignedCount} students to Center ${center.centerId} for Workshop ${workshopId}`);
    }
}
