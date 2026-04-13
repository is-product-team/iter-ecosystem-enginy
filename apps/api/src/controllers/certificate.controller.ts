import prisma from '../lib/prisma.js';
import { Request, Response } from 'express';
import { CertificateService } from '../services/certificate.service.js';
import { QuestionnaireService } from '../services/questionnaire.service.js';

const certificateService = new CertificateService();
const questionnaireService = new QuestionnaireService();

// POST: Generate certificates for an assignment (Automatic on close)
export const generateCertificates = async (req: Request, res: Response) => {
    const { assignmentId } = req.body;
    const id = parseInt(assignmentId);

    try {
        const result = await certificateService.issueCertificatesForAssignment(id);
        res.json({
            success: true,
            ...result
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

export const getMyCertificates = async (req: Request, res: Response) => {
    const user = (req as any).user;
    
    try {
        const certificates = await prisma.certificate.findMany({
            where: {
                student: {
                    userId: user.userId
                }
            },
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

export const downloadCertificate = async (req: Request, res: Response) => {
    const { assignmentId } = req.params;
    const user = (req as any).user;

    try {
        const enrollment = await prisma.enrollment.findFirst({
            where: {
                assignmentId: parseInt(assignmentId as string),
                student: {
                    userId: user.userId
                }
            },
            include: {
                selfConsultation: true
            }
        });

        if (!enrollment) {
            return res.status(404).json({ error: 'Evaluation or enrollment not found for this user.' });
        }

        if (!enrollment.selfConsultation) {
            return res.status(403).json({ 
                error: 'SURVEY_REQUIRED', 
                message: 'Has de completar l’enquesta de satisfacció abans de descarregar el certificat.' 
            });
        }

        const certificate = await prisma.certificate.findUnique({
            where: {
                studentId_assignmentId: {
                    studentId: enrollment.studentId,
                    assignmentId: enrollment.assignmentId
                }
            }
        });

        if (!certificate) {
            return res.status(403).json({ error: 'Certificate not issued yet. Minimum attendance might not be met.' });
        }

        const pdfBuffer = await certificateService.getCertificateForStudent(enrollment.enrollmentId);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=certificate_${assignmentId}.pdf`);
        res.send(Buffer.from(pdfBuffer));
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ error: 'Could not generate certificate' });
    }
};

export const downloadBulkCertificates = async (req: Request, res: Response) => {
    const { assignmentId } = req.params;
    const user = (req as any).user;

    if (user.role !== 'ADMIN' && user.role !== 'COORDINATOR') {
        return res.status(403).json({ error: 'Unauthorized to download bulk certificates' });
    }

    try {
        const zipBuffer = await certificateService.generateBulkZip(parseInt(assignmentId as string));
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename=certificats_taller_${assignmentId}.zip`);
        res.send(zipBuffer);
    } catch (error: any) {
        console.error('Bulk download error:', error);
        res.status(500).json({ error: error.message || 'Error generating bulk certificates' });
    }
};

export const getAssignmentStats = async (req: Request, res: Response) => {
    const { assignmentId } = req.params;

    try {
        const stats = await questionnaireService.getAggregatedStats(parseInt(assignmentId as string));
        res.json(stats);
    } catch (error: any) {
        console.error('Stats error:', error);
        res.status(500).json({ error: 'Could not retrieve assignment statistics' });
    }
};
