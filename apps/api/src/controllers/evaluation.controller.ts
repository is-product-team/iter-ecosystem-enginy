import { Request, Response } from 'express';
import { EvaluationService } from '../services/evaluation.service.js';
import { NLPService } from '../services/nlp.service.js';
import prisma from '../lib/prisma.js';

const evaluationService = new EvaluationService();
const nlpService = new NLPService();

export const getEnrollmentEvaluation = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const evaluation = await evaluationService.getEvaluationByEnrollment(parseInt(id as string));
        if (!evaluation) {
            return res.status(404).json({ error: 'Evaluation not found' });
        }
        res.json(evaluation);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching evaluation' });
    }
};

export const upsertEvaluation = async (req: Request, res: Response) => {
    try {
        let { id_enrollment, id_student, id_assignment, observations, competencies, attendancePercentage, lateCount } = req.body;

        if (!id_enrollment) {
            if (id_student && id_assignment) {
                const inscripcio = await prisma.enrollment.findFirst({
                    where: {
                        id_student: parseInt(id_student),
                        id_assignment: parseInt(id_assignment)
                    }
                });

                if (inscripcio) {
                    id_enrollment = inscripcio.id_enrollment;
                } else {
                    return res.status(404).json({ error: 'Enrollment not found for this student and assignment.' });
                }
            } else {
                return res.status(400).json({ error: 'Required id_enrollment OR (id_student + id_assignment).' });
            }
        }

        if (!id_assignment) {
            return res.status(400).json({ error: 'id_assignment is required.' });
        }

        const dataToUpsert = {
            id_enrollment: parseInt(id_enrollment),
            id_assignment: parseInt(id_assignment),
            observations: observations || '',
            competences: competencies || [], // Mapped to competences
            attendancePercentage: attendancePercentage || 100, 
            lateCount: lateCount || 0
        };

        const result = await evaluationService.upsertEvaluation(dataToUpsert as any);
        res.json(result);
    } catch (error) {
        console.error("Error in upsertEvaluation:", error);
        res.status(500).json({ error: 'Error saving evaluation' });
    }
};

export const getCompetencies = async (req: Request, res: Response) => {
    try {
        const competencies = await evaluationService.getCompetencies();
        res.json(competencies);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching competencies' });
    }
};

export const analyzeObservations = async (req: Request, res: Response) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ error: 'Text is required' });
    }
    try {
        const analysis = await evaluationService.analyzeObservationsAI(text);
        res.json(analysis);
    } catch (error) {
        res.status(500).json({ error: 'Error analyzing observations' });
    }
};

export const processVoiceEvaluation = async (req: Request, res: Response) => {
    const { text, studentId, sessionId, assignmentId } = req.body;

    if (!text || !studentId || !sessionId || !assignmentId) {
        return res.status(400).json({ error: 'Missing required parameters (text, studentId, sessionId, assignmentId).' });
    }

    try {
        const nlpResult = nlpService.processText(text);

        const enrollmentRecord = await prisma.enrollment.findFirst({
            where: {
                id_student: parseInt(studentId),
                id_assignment: parseInt(assignmentId)
            }
        });

        let attendanceRecord = null;

        if (enrollmentRecord) {
            const existingAttendance = await prisma.attendance.findFirst({
                where: {
                    id_enrollment: enrollmentRecord.id_enrollment,
                    sessionNumber: parseInt(sessionId)
                }
            });

            const dataToSave = {
                id_enrollment: enrollmentRecord.id_enrollment,
                sessionNumber: parseInt(sessionId),
                sessionDate: new Date(),
                status: nlpResult.attendanceStatus || (existingAttendance ? (existingAttendance as any).status : 'PRESENT'),
                observations: text
            };

            if (existingAttendance) {
                attendanceRecord = await prisma.attendance.update({
                    where: { id_attendance: existingAttendance.id_attendance },
                    data: {
                        status: dataToSave.status,
                        observations: dataToSave.observations,
                        sessionDate: new Date()
                    }
                });
            } else {
                attendanceRecord = await prisma.attendance.create({
                    data: dataToSave
                });
            }
        }

        let competenceEval = null;
        if (nlpResult.competenceUpdate && enrollmentRecord) {
            const competence = await prisma.competence.findFirst({
                where: { type: 'Transversal' }
            });

            if (competence) {
                let docentEval = await prisma.evaluation.findUnique({
                    where: { id_enrollment: enrollmentRecord.id_enrollment }
                });

                if (!docentEval) {
                    docentEval = await prisma.evaluation.create({
                        data: {
                            id_enrollment: enrollmentRecord.id_enrollment,
                            id_assignment: enrollmentRecord.id_assignment,
                            attendancePercentage: 100,
                            lateCount: 0,
                            observations: 'Initialized by Voice Assistant'
                        }
                    });
                }

                competenceEval = await prisma.competenceEvaluation.create({
                    data: {
                        id_evaluation_teacher: docentEval.id_evaluation_teacher,
                        id_competence: competence.id_competence,
                        score: nlpResult.competenceUpdate.score
                    }
                });
            }
        }

        res.json({
            originalText: text,
            analysis: nlpResult,
            updates: {
                attendance: attendanceRecord,
                competenceEvaluation: competenceEval
            }
        });

    } catch (error) {
        console.error("Error processing voice evaluation:", error);
        res.status(500).json({ error: 'Error processing voice evaluation.' });
    }
};
