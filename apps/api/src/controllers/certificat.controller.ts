import prisma from '../lib/prisma.js';
import { Request, Response } from 'express';

// POST: Generar certificados para una asignación (Automático al cerrar)
export const generateCertificates = async (req: Request, res: Response) => {
    const { idAssignment } = req.body;
    const id = parseInt(idAssignment);

    try {
        const assignacio = await prisma.assignment.findUnique({
            where: { id_assignment: id },
            include: {
                enrollments: {
                    include: {
                        alumne: true,
                        attendance: true
                    }
                }
            }
        });

        if (!assignacio) return res.status(404).json({ error: 'Asignación no encontrada' });

        const totalSessions = 10;
        let certificatesIssued = 0;

        for (const inscripcio of assignacio.inscripcions) {
            const attendedCount = (inscripcio.assistencia as any[]).filter((a: any) =>
                a.estat === 'Present' || a.estat === 'Retard'
            ).length;

            const percentage = (attendedCount / totalSessions) * 100;

            if (percentage >= 80) {
                await prisma.certificate.upsert({
                    where: {
                        id_student_id_assignment: {
                            id_student: inscripcio.id_student,
                            id_assignment: id
                        }
                    },
                    update: {},
                    create: {
                        id_student: inscripcio.id_student,
                        id_assignment: id,
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
        if (alumneId) where.id_student = parseInt(alumneId as string);

        const certificats = await prisma.certificate.findMany({
            where,
            include: {
                assignacio: {
                    include: { taller: true }
                },
                alumne: true
            }
        });

        res.json(certificats);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener certificados' });
    }
};
