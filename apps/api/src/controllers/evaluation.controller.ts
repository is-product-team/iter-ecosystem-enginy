import { Request, Response } from 'express';
import { EvaluationService } from '../services/evaluation.service.js';
import { NLPService } from '../services/nlp.service.js';
import prisma from '../lib/prisma.js';

const evaluationService = new EvaluationService();
const nlpService = new NLPService();

export const getInscripcioEvaluation = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const evaluation = await evaluationService.getEvaluationByInscripcio(parseInt(id as string));
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
        let { id_inscripcio, id_alumne, id_assignacio, observacions, competencies, percentatge_asistencia, numero_retards } = req.body;

        if (!id_inscripcio) {
            if (id_alumne && id_assignacio) {
                const inscripcio = await prisma.inscripcio.findFirst({
                    where: {
                        id_alumne: parseInt(id_alumne),
                        id_assignacio: parseInt(id_assignacio)
                    }
                });

                if (inscripcio) {
                    id_inscripcio = inscripcio.id_inscripcio;
                } else {
                    return res.status(404).json({ error: 'Enrollment not found for this student and assignment.' });
                }
            } else {
                return res.status(400).json({ error: 'Required id_inscripcio OR (id_alumne + id_assignacio).' });
            }
        }

        const dataToUpsert = {
            id_inscripcio: parseInt(id_inscripcio),
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

        const inscripcio = await prisma.inscripcio.findFirst({
            where: {
                id_alumne: parseInt(studentId),
                id_assignacio: parseInt(assignacioId)
            }
        });

        let assistencia = null;

        if (inscripcio) {
            const existingAssistencia = await prisma.assistencia.findFirst({
                where: {
                    id_inscripcio: inscripcio.id_inscripcio,
                    numero_sessio: parseInt(sessionId)
                }
            });

            const dataToSave = {
                id_inscripcio: inscripcio.id_inscripcio,
                numero_sessio: parseInt(sessionId),
                data_sessio: new Date(),
                estat: result.attendanceStatus || (existingAssistencia ? existingAssistencia.estat : 'Present'),
                observacions: text
            };

            if (existingAssistencia) {
                assistencia = await prisma.assistencia.update({
                    where: { id_assistencia: existingAssistencia.id_assistencia },
                    data: {
                        estat: dataToSave.estat,
                        observacions: dataToSave.observacions,
                        data_sessio: new Date()
                    }
                });
            } else {
                assistencia = await prisma.assistencia.create({
                    data: dataToSave
                });
            }
        }

        let competenceEvaluation = null;
        if (result.competenceUpdate && inscripcio) {
            const competencia = await prisma.competencia.findFirst({
                where: { tipus: 'Transversal' }
            });

            if (competencia) {
                let docentEval = await prisma.avaluacioDocent.findUnique({
                    where: { id_inscripcio: inscripcio.id_inscripcio }
                });

                if (!docentEval) {
                    docentEval = await prisma.avaluacioDocent.create({
                        data: {
                            id_inscripcio: inscripcio.id_inscripcio,
                            percentatge_asistencia: 100,
                            numero_retards: 0,
                            observacions: 'Initialized by Voice Assistant'
                        }
                    });
                }

                competenceEvaluation = await prisma.avaluacioCompetencial.create({
                    data: {
                        id_avaluacio_docent: docentEval.id_avaluacio_docent,
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
