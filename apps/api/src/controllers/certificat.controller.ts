import prisma from '../lib/prisma.js';
import { Request, Response } from 'express';

// POST: Generar certificados para una asignación (Automático al cerrar)
export const generateCertificates = async (req: Request, res: Response) => {
    const { idAssignacio } = req.body;
    const id = parseInt(idAssignacio);

    try {
        const assignacio = await prisma.assignacio.findUnique({
            where: { id_assignacio: id },
            include: {
                inscripcions: {
                    include: {
                        alumne: true,
                        assistencia: true
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
                await prisma.certificat.upsert({
                    where: {
                        id_alumne_id_assignacio: {
                            id_alumne: inscripcio.id_alumne,
                            id_assignacio: id
                        }
                    },
                    update: {},
                    create: {
                        id_alumne: inscripcio.id_alumne,
                        id_assignacio: id,
                        data_emissio: new Date()
                    }
                });
                certificatesIssued++;
            }
        }

        res.json({
            success: true,
            message: `${certificatesIssued} certificados generados.`,
            totalStudents: assignacio.inscripcions.length
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
        if (alumneId) where.id_alumne = parseInt(alumneId as string);

        const certificats = await prisma.certificat.findMany({
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
