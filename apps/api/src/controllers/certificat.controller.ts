import prisma from '../lib/prisma.js';
import { Request, Response } from 'express';

// POST: Generar certificados para una asignación (Automático al cerrar)
export const generateCertificates = async (req: Request, res: Response) => {
    const { idAssignment } = req.body;
    const id = parseInt(idAssignment);

    try {
        const assignacio = await prisma.assignment.findUnique({
            where: { assignmentId: id },
            include: {
                enrollments: {
                    include: {
                        student: true,
                        attendance: true
                    }
                }
            }
        });

        if (!assignacio) return res.status(404).json({ error: 'Asignación no encontrada' });

        const totalSessions = 10;
        let certificatesIssued = 0;

        for (const inscripcio of assignacio.enrollments) {
            const attendedCount = (inscripcio.attendance as any[]).filter((a: any) =>
                a.estat === 'Present' || a.estat === 'Retard'
            ).length;

            const percentage = (attendedCount / totalSessions) * 100;

            if (percentage >= 80) {
                await prisma.certificate.upsert({
                    where: {
                        studentId_assignmentId: {
                            studentId: inscripcio.studentId,
                            assignmentId: id
                        }
                    },
                    update: {},
                    create: {
                        studentId: inscripcio.studentId,
                        assignmentId: id,
                        data_emissio: new Date()
                    }
                });
                certificatesIssued++;
            }
        }

        res.json({
            success: true,
            message: `${certificatesIssued} certificados generados.`,
            totalStudents: assignacio.enrollments.length
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al generar certificados' });
    }
};

export const getMyCertificates = async (req: Request, res: Response) => {
    const { alumneId } = req.query;

    try {
        const where: any = {};
        if (alumneId) where.studentId = parseInt(alumneId as string);

        const certificats = await prisma.certificate.findMany({
            where,
            include: {
                assignment: {
                    include: { workshop: true }
                },
                student: true
            }
        });

        res.json(certificats);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener certificados' });
    }
};
