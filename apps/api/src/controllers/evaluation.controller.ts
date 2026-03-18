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
        let { id_enrollment, id_student, id_assignment, observacions, competencies, percentatge_asistencia, numero_retards } = req.body;

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

        const dataToUpsert = {
            id_enrollment: parseInt(id_enrollment),
            observacions: observacions || '',
            competencies: competencies || [],
            percentatge_asistencia: percentatge_asistencia || 100, 
            numero_retards: numero_retards || 0
        };

        const result = await evaluationService.upsertEvaluation(dataToUpsert);
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
    const { text, studentId, sessionId, assignacioId } = req.body;

    if (!text || !studentId || !sessionId) {
        return res.status(400).json({ error: 'Missing required parameters (text, studentId, sessionId).' });
    }

    try {
        const result = nlpService.processText(text);

        const inscripcio = await prisma.enrollment.findFirst({
            where: {
                id_student: parseInt(studentId),
                id_assignment: parseInt(assignacioId)
            }
        });

        let assistencia = null;

        if (inscripcio) {
            const existingAttendance = await prisma.attendance.findFirst({
                where: {
                    id_enrollment: inscripcio.id_enrollment,
                    numero_sessio: parseInt(sessionId)
                }
            });

            const dataToSave = {
                id_enrollment: inscripcio.id_enrollment,
                numero_sessio: parseInt(sessionId),
                data_sessio: new Date(),
                estat: result.attendanceStatus || (existingAttendance ? existingAttendance.estat : 'Present'),
                observacions: text
            };

            if (existingAttendance) {
                assistencia = await prisma.attendance.update({
                    where: { id_attendance: existingAttendance.id_attendance },
                    data: {
                        estat: dataToSave.estat,
                        observacions: dataToSave.observacions,
                        data_sessio: new Date()
                    }
                });
            } else {
                assistencia = await prisma.attendance.create({
                    data: dataToSave
                });
            }
        }

        let competenceEvaluation = null;
        if (result.competenceUpdate && inscripcio) {
            const competencia = await prisma.competence.findFirst({
                where: { tipus: 'Transversal' }
            });

            if (competencia) {
                let docentEval = await prisma.evaluation.findUnique({
                    where: { id_enrollment: inscripcio.id_enrollment }
                });

                if (!docentEval) {
                    docentEval = await prisma.evaluation.create({
                        data: {
                            id_enrollment: inscripcio.id_enrollment,
                            percentatge_asistencia: 100,
                            numero_retards: 0,
                            observacions: 'Initialized by Voice Assistant'
                        }
                    });
                }

                competenceEvaluation = await prisma.avaluacioCompetencial.create({
                    data: {
                        id_evaluation_teacher: docentEval.id_evaluation_teacher,
                        id_competencia: competencia.id_competencia,
                        puntuacio: result.competenceUpdate.score
                    }
                });
            }
        }

        res.json({
            originalText: text,
            analysis: result,
            updates: {
                assistencia,
                competenceEvaluation
            }
        });

    } catch (error) {
        console.error("Error processing voice evaluation:", error);
        res.status(500).json({ error: 'Error processing voice evaluation.' });
    }
};
