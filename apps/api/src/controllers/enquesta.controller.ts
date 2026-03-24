import prisma from '../lib/prisma.js';
import { Request, Response } from 'express';
import { Prisma, QuestionnaireTarget } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

// POST: Generar encuestas para una asignación finalizada
// Se llama automáticamente al cerrar asignación, pero también se puede forzar
export const generateEnquestes = async (req: Request, res: Response) => {
    const { idAssignment } = req.body;

    try {
        const assignacio = await prisma.assignment.findUnique({
            where: { id_assignment: parseInt(idAssignment) },
            include: {
                enrollments: { include: { student: true } },
                teachers: { include: { user: true } },
                center: true
            }
        });

        if (!assignacio) return res.status(404).json({ error: 'Asignación no encontrada' });

        // 1. Generar tokens para Alumnos
        const questionnairesData: Prisma.QuestionnaireCreateManyInput[] = [];

        // Alumnos
        for (const enrollment of assignacio.enrollments) {
            questionnairesData.push({
                id_assignment: assignacio.id_assignment,
                destinatari: QuestionnaireTarget.ALUMNE,
                token: uuidv4(),
                completa: false
            });
        }

        // Profesores
        for (const teacher of assignacio.teachers) {
            questionnairesData.push({
                id_assignment: assignacio.id_assignment,
                destinatari: QuestionnaireTarget.PROFESSOR,
                token: uuidv4(),
                completa: false
            });
        }

        // Centro (1 por asignación)
        questionnairesData.push({
            id_assignment: assignacio.id_assignment,
            destinatari: QuestionnaireTarget.CENTRE,
            token: uuidv4(),
            completa: false
        });

        // Guardar en Prisma (Postgres)
        const created = await prisma.questionnaire.createMany({
            data: questionnairesData,
            skipDuplicates: true
        });

        res.json({ message: 'Encuestas generadas', count: created.count });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al generar encuestas' });
    }
};

// GET: Obtener encuesta por Token
export const getEnquestaByToken = async (req: Request, res: Response) => {
    const token = req.params.token as string;

    try {
        const enquesta = await prisma.questionnaire.findUnique({
            where: { token },
            include: { assignment: { include: { workshop: true } } }
        });

        if (!enquesta) {
            return res.status(404).json({ error: 'Encuesta no válida' });
        }

        if (enquesta.completa) {
            return res.status(400).json({ error: 'Esta encuesta ya ha sido completada' });
        }

        // Obtener preguntas del modelo (según destinatario)
        const model = await prisma.questionnaireModel.findFirst({
            where: { destinatari: enquesta.destinatari },
            include: { questions: true }
        });

        res.json({
            enquesta,
            questions: model?.questions || []
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al cargar encuesta' });
    }
};

// POST: Enviar respuesta encuesta
export const submitEnquesta = async (req: Request, res: Response) => {
    const token = req.params.token as string;
    // const { respostes } = req.body;

    try {
        const enquesta = await prisma.questionnaire.findUnique({ where: { token } });

        if (!enquesta) return res.status(404).json({ error: 'Encuesta no encontrada' });
        if (enquesta.completa) return res.status(400).json({ error: 'Encuesta ya completada' });

        // 1. Marcar como completada en Postgres
        await prisma.questionnaire.update({
            where: { token },
            data: {
                completa: true,
                data_completat: new Date()
            }
        });

        res.json({ success: true, message: 'Encuesta enviada correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al guardar respuesta' });
    }
};

