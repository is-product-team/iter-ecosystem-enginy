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
        console.error('Generation error:', error);
        res.status(500).json({ error: error.message || 'Error generating certificates' });
    }
};

// GET: List certificates for current user or filter by student (for Admin)
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

// GET: Bulk download certificates in ZIP (Admin/Coordinator only)
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

// GET: Aggregated analytics for an assignment (Admin/Coordinator only)
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
