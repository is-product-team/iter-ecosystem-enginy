import prisma from '../lib/prisma.js';
import { Request, Response } from 'express';

// POST: Generate certificates for an assignment (Automatic on close)
export const generateCertificates = async (req: Request, res: Response) => {
    const { assignmentId } = req.body;
    const id = parseInt(assignmentId);

    try {
        const assignment = await prisma.assignment.findUnique({
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

        if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

        const totalSessions = 10; // This should ideally be dynamic based on the workshop
        let certificatesIssued = 0;

        for (const enrollment of assignment.enrollments) {
            const attendedCount = (enrollment.attendance as any[]).filter((a: any) =>
                a.status === 'PRESENT' || a.status === 'LATE'
            ).length;

            const percentage = (attendedCount / totalSessions) * 100;

            if (percentage >= 80) {
                await prisma.certificate.upsert({
                    where: {
                        studentId_assignmentId: {
                            studentId: enrollment.studentId,
                            assignmentId: id
                        }
                    },
                    update: {},
                    create: {
                        studentId: enrollment.studentId,
                        assignmentId: id,
                        issuedAt: new Date()
                    }
                });
                certificatesIssued++;
            }
        }

        res.json({
            success: true,
            message: `${certificatesIssued} certificates generated.`,
            totalStudents: assignment.enrollments.length
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error generating certificates' });
    }
};

export const getMyCertificates = async (req: Request, res: Response) => {
    const { studentId } = req.query;

    try {
        const where: any = {};
        if (studentId) where.studentId = parseInt(studentId as string);

        const certificates = await prisma.certificate.findMany({
            where,
            include: {
                assignment: {
                    include: { workshop: true }
                },
                student: true
            }
        });

        res.json(certificates);
    } catch (_error) {
        res.status(500).json({ error: 'Error obtaining certificates' });
    }
};
