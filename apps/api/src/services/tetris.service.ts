import prisma from '../lib/prisma.js';
import { createNotificationInterna } from '../controllers/notificacio.controller.js';

export class TetrisService {
    /**
     * Logic to "fit" requests into vacant workshop spots.
     */
    async processVacancies() {
        // 1. Get assignments with status VACANT
        const vacancies = await prisma.assignment.findMany({
            where: { status: 'VACANT' },
            include: { workshop: true }
        });

        if (vacancies.length === 0) return { message: 'No vacancies found.' };

        let resolved = 0;

        for (const vacancy of vacancies) {
            // 2. Find PENDING requests for the same workshop
            const p = await prisma.request.findFirst({
                where: {
                    workshopId: vacancy.workshopId,
                    status: 'PENDING'
                },
                orderBy: { createdAt: 'asc' }
            });

            if (p) {
                // 3. Match!
                await prisma.assignment.update({
                    where: { assignmentId: vacancy.assignmentId },
                    data: {
                        requestId: p.requestId,
                        centerId: p.centerId,
                        status: 'PUBLISHED'
                    }
                });

                await prisma.request.update({
                    where: { requestId: p.requestId },
                    data: { status: 'APPROVED' }
                });

                // 4. Notify center
                await createNotificationInterna({
                    centerId: p.centerId,
                    title: '¡Taller Asignado (Tetris)!',
                    message: `Your request for the workshop "${vacancy.workshop.title}" has been approved and assigned.`,
                    type: 'REQUEST',
                    importance: 'INFO'
                });

                resolved++;
            }
        }

        return { resolved };
    }
}
