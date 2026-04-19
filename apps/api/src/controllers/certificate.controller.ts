import prisma from '../lib/prisma.js';
import { Request, Response } from 'express';
import { CertificateService } from '../services/certificate.service.js';
import { QuestionnaireService } from '../services/questionnaire.service.js';
import { ROLES } from '@iter/shared';

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
    const { studentId: queryStudentId } = req.query;
    const { role, userId } = req.user!;

    try {
        const where: any = {};
        let finalStudentId: number | undefined;
        
        // Security Scoping
        if (role === ROLES.STUDENT) {
            // Students can ONLY see their own certificates
            const student = await prisma.student.findUnique({
                where: { userId }
            });
            
            if (!student) {
                return res.status(403).json({ error: 'No student record associated with this user' });
            }
            finalStudentId = student.studentId;
            where.studentId = finalStudentId;
        } else if (role === ROLES.ADMIN) {
            // Admins can filter by studentId if provided
            if (queryStudentId) {
                where.studentId = parseInt(queryStudentId as string);
            }
        } else {
            // Other roles (Coordinators/Teachers)
            if (role !== ROLES.ADMIN) {
                return res.status(403).json({ error: 'Access denied' });
            }
        }

        const certificates = await prisma.certificate.findMany({
            where,
            include: {
                assignment: {
                    include: { 
                        workshop: true,
                        enrollments: {
                            // Load enrollments for survey check. 
                            // If student, only load theirs. If Admin, load all for the assignment.
                            where: role === ROLES.STUDENT ? { studentId: finalStudentId } : undefined,
                            include: { selfConsultation: true }
                        }
                    }
                },
                student: true
            }
        });

        // Add survey status for the frontend (Task 1.1 Fix)
        const result = certificates.map(cert => {
            // Ensure we check the survey of the specific student of this certificate
            const enrollment = cert.assignment.enrollments.find(e => e.studentId === cert.studentId);
            return {
                ...cert,
                surveyCompleted: !!enrollment?.selfConsultation
            };
        });

        res.json(result);
    } catch (error) {
        console.error('Error obtaining certificates:', error);
        res.status(500).json({ error: 'Error obtaining certificates' });
    }
};

// GET: Download a single certificate (Student/Admin)
export const downloadCertificate = async (req: Request, res: Response) => {
    const { assignmentId } = req.params;
    const { studentId: queryStudentId } = req.query;
    const { role, userId } = req.user!;
    const aid = parseInt(assignmentId as string);

    try {
        // Determine whose certificate we are looking for (Task 1.2 Fix)
        let targetStudentId: number | undefined;
        
        if (role === ROLES.STUDENT) {
            const student = await prisma.student.findUnique({
                where: { userId }
            });
            if (!student) return res.status(404).json({ error: 'Student profile not found' });
            targetStudentId = student.studentId;
        } else if (queryStudentId) {
            targetStudentId = parseInt(queryStudentId as string);
        }

        if (!targetStudentId) {
            return res.status(400).json({ error: 'Missing student ID' });
        }

        // 1. Verify certificate exists
        const certificate = await prisma.certificate.findFirst({
            where: {
                assignmentId: aid,
                studentId: targetStudentId
            },
            include: {
                student: true,
                assignment: {
                    include: {
                        enrollments: {
                            where: { studentId: targetStudentId },
                            include: { selfConsultation: true }
                        }
                    }
                }
            }
        });

        if (!certificate) {
            return res.status(404).json({ error: 'Certificate not found' });
        }

        // 2. Survey Gate Check (Task 1.3)
        if (role === ROLES.STUDENT) {
            const enrollment = certificate.assignment.enrollments[0];
            if (!enrollment?.selfConsultation) {
                return res.status(403).json({ 
                    error: 'SURVEY_REQUIRED',
                    message: 'Debes completar la encuesta de satisfacción antes de descargar el certificado.' 
                });
            }
        }

        // 3. Generate and stream PDF
        const pdfBuffer = await certificateService.generatePDF(certificate.student, aid);
        
        const fileName = `certificat_${aid}_${certificate.student.idalu || certificate.student.studentId}.pdf`;
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        res.send(Buffer.from(pdfBuffer));

    } catch (error: any) {
        console.error('Download error:', error);
        res.status(500).json({ error: error.message || 'Error downloading certificate' });
    }
};

// GET: Bulk download certificates in ZIP (Admin/Coordinator only)
export const downloadBulkCertificates = async (req: Request, res: Response) => {
    const { assignmentId } = req.params;
    const { role, centerId } = req.user!;

    if (role !== ROLES.ADMIN && role !== ROLES.COORDINATOR) {
        return res.status(403).json({ error: 'Unauthorized to download bulk certificates' });
    }

    try {
        // Center check for coordinators
        if (role === ROLES.COORDINATOR) {
            const assignment = await prisma.assignment.findUnique({
                where: { assignmentId: parseInt(assignmentId as string) },
                select: { centerId: true }
            });
            if (!assignment || Number(assignment.centerId) !== Number(centerId)) {
                return res.status(403).json({ error: 'Unauthorized: Center mismatch' });
            }
        }

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
