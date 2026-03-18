import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { NLPService } from '../services/nlp.service.js';

export const processVoiceEvaluation = async (req: Request, res: Response) => {
    const { text, studentId, sessionId, assignacioId } = req.body;

    if (!text || !studentId || !sessionId) {
        return res.status(400).json({ error: 'Faltan parámetros requeridos (text, studentId, sessionId).' });
    }

    try {
        const nlpService = new NLPService();
        const result = nlpService.processText(text);

        // 1. Update/Create Assistencia
        // We need to find the Inscripcio first
        const inscripcio = await prisma.inscripcio.findFirst({
            where: {
                id_alumne: parseInt(studentId),
                id_assignacio: parseInt(assignacioId) // Optional if we just query by student, but safer with session context
            }
        });

        let assistencia = null;

        if (inscripcio) {
            // Upsert Assistencia
            // Since the schema might not have a unique compound constraint on (inscripcio, sessio),
            // we use findFirst -> update/create pattern or just create.
            // For this prototype, let's assume valid data.

            const existingAssistencia = await prisma.assistencia.findFirst({
                where: {
                    id_inscripcio: inscripcio.id_inscripcio,
                    numero_sessio: parseInt(sessionId)
                }
            });

            const dataToSave = {
                id_inscripcio: inscripcio.id_inscripcio,
                numero_sessio: parseInt(sessionId),
                data_sessio: new Date(), // Today
                estat: result.attendanceStatus || (existingAssistencia ? existingAssistencia.estat : 'Present'),
                observacions: text // We save the full text
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

        // 2. Update Competence (if detected)
        let competenceEvaluation = null;
        if (result.competenceUpdate && inscripcio) {
            // Find 'Transversal' competence or specific one.
            const competencia = await prisma.competencia.findFirst({
                where: { tipus: 'Transversal' }
            });

            if (competencia) {
                // Ensure AvaluacioDocent exists
                let docentEval = await prisma.avaluacioDocent.findUnique({
                    where: { id_inscripcio: inscripcio.id_inscripcio }
                });

                if (!docentEval) {
                    docentEval = await prisma.avaluacioDocent.create({
                        data: {
                            id_inscripcio: inscripcio.id_inscripcio,
                            percentatge_asistencia: 100, // Default initialization
                            numero_retards: 0,
                            observacions: 'Inicializado por Asistente de Voz'
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
        res.status(500).json({ error: 'Error al procesar la evaluación de voz.' });
    }
};
