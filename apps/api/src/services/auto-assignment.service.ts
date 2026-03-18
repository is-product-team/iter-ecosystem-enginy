import prisma from '../lib/prisma.js';

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
                estat: { in: ['Aprovada', 'Pendent'] },
                modalitat: 'C',
                assignments: {
                    none: {}
                }
            },
            include: {
                centre: true,
                students: true
            },
            orderBy: {
                data_peticio: 'asc'
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
            const remainingCapacity = taller.places_maximes - occupiedPlazas;

            console.log(`📊 AutoAssignment: Workshop ID ${tallerId} (${taller.titol}): Capacity: ${taller.places_maximes}, Occupied: ${occupiedPlazas}, Remaining: ${remainingCapacity}`);

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
                if (!p.alumnes || p.students.length === 0) return;

                if (!centerMap.has(p.id_center)) {
                    centerMap.set(p.id_center, {
                        centerId: p.id_center,
                        students: [],
                        peticioId: p.id_request, // Track the main petition ID (or latest)
                        timestamp: p.data_peticio,
                        assignedCount: 0
                    });
                }
                const entry = centerMap.get(p.id_center)!;
                // Add students
                p.students.forEach((a: any) => entry.students.push(a.id_student));
                // Keep the earliest timestamp for priority
                if (p.data_peticio < entry.timestamp) {
                    entry.timestamp = p.data_peticio;
                }
            });

            const centers = Array.from(centerMap.values());
            const totalDemand = centers.reduce((sum: number, c: any) => sum + c.students.length, 0);

            // DISTRIBUTION LOGIC
            let allocated = 0;

            if (totalDemand <= remainingCapacity) {
                // Happy Path: Give everyone everything
                centers.forEach((c: any) => c.assignedCount = c.students.length);
                allocated = totalDemand;
            } else {
                // Scarcity Logic: Fair Share
                const numCenters = centers.length;
                const baseShare = Math.floor(remainingCapacity / numCenters);
                
                // 1. Base Allocation
                let leftoverSpots = remainingCapacity;
                
                centers.forEach((c: any) => {
                    const allocation = Math.min(c.students.length, baseShare);
                    c.assignedCount = allocation;
                    leftoverSpots -= allocation;
                });

                // 2. Distribute Leftovers by Priority (Earliest Timestamp)
                // Sort centers by timestamp
                centers.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

                let i = 0;
                while (leftoverSpots > 0) {
                    const center = centers[i % numCenters]; // Round robin if we loop? 
                    // Actually, requirement says "por orden de llegada". 
                    // So we iterate prioritized list. If a center still needs spots, give 1.
                    // But usually "order de llegada" implies the first one gets as much as possible?
                    // "si son impares, por orden de llegada" implies the REMAINDER is distributed by order.
                    
                    if (center.assignedCount < center.students.length) {
                        center.assignedCount++;
                        leftoverSpots--;
                    }
                    
                    // Move to next center? Or fill this one? 
                    // "Assign the remainder by order of arrival" usually means distributing the odd lots.
                    // Example: 5 spots, 2 centers. Share = 2. Remainder = 1.
                    // Center A (Early) gets +1 -> Total 3. Center B gets 2.
                    // So we iterate once through the sorted list.
                    i++;
                    if (i >= numCenters * 2 && leftoverSpots > 0) break; // Breaker preventing infinite loop if logic fails
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
        const studentsToAssign = center.students.slice(0, center.assignedCount);

        // Update Petition Status
        await prisma.request.update({
            where: { id_request: center.peticioId },
            data: { estat: 'Aprovada' }
        });

        // Create Assignment
        const assignacio = await prisma.assignment.create({
            data: {
                id_request: center.peticioId,
                id_center: center.centerId,
                id_workshop: tallerId,
                estat: 'PUBLISHED',
                checklist: {
                    create: [
                        { pas_nom: 'Designar Profesores Referentes', completat: false },
                        { pas_nom: 'Subir Registro Nominal (Excel)', completat: true },
                        { pas_nom: 'Acuerdo Pedagógico (Modalidad C)', completat: false }
                    ]
                }
            }
        });

        // Create Enrollmentns
        await prisma.enrollment.createMany({
            data: studentsToAssign.map(sid => ({
                id_assignment: assignacio.id_assignment,
                id_student: sid
            }))
        });

        // Generate Sessions (Copy from original)
        const taller = await prisma.workshop.findUnique({ where: { id_workshop: tallerId } });
        if (taller && taller.dies_execucio) {
            const schedule = taller.dies_execucio as any[];
            if (Array.isArray(schedule) && schedule.length > 0) {
                const sessionsData = schedule.map(slot => {
                    const d = new Date();
                    d.setDate(d.getDate() + 1);
                    while (d.getDay() !== slot.dayOfWeek) {
                        d.setDate(d.getDate() + 1);
                    }
                    return {
                        id_assignment: assignacio.id_assignment,
                        data_sessio: d,
                        hora_inici: slot.startTime,
                        hora_fi: slot.endTime
                    };
                });
                await prisma.session.createMany({ data: sessionsData });
            }
        }

        console.log(`✅ AutoAssignment: Assigned ${center.assignedCount} students to Center ${center.centerId} for Workshop ${tallerId}`);
    }
}
