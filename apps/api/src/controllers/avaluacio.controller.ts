import { Request, Response } from 'express';
import { AvaluacioService } from '../services/avaluacio.service.js';
import prisma from '../lib/prisma.js'; // Import prisma to lookup inscripcio

const avaluacioService = new AvaluacioService();

export const getAvaluacioInscripcio = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const avaluacio = await avaluacioService.getAvaluacioInscripcio(parseInt(id as string));
        if (!avaluacio) {
            return res.status(404).json({ error: 'Evaluación no encontrada' });
        }
        res.json(avaluacio);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener la evaluación' });
    }
};

export const upsetAvaluacioDocent = async (req: Request, res: Response) => {
    try {
        let { id_inscripcio, id_alumne, id_assignacio, observacions, competencies, percentatge_asistencia, numero_retards } = req.body;

        // 1. Resolve id_inscripcio if not provided
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
                    return res.status(404).json({ error: 'Inscripción no encontrada para este alumno y asignación.' });
                }
            } else {
                return res.status(400).json({ error: 'Se requiere id_inscripcio O (id_alumne + id_assignacio).' });
            }
        }

        // 2. Prepare data with defaults
        const dataToUpsert = {
            id_inscripcio: parseInt(id_inscripcio),
            observacions: observacions || '',
            competencies: competencies || [],
            // Defaults as UI doesn't send these yet. 
            // Ideally we should calculate them from 'assistencia' table but for now 100% is a safe fallback to avoid crash.
            percentatge_asistencia: percentatge_asistencia || 100, 
            numero_retards: numero_retards || 0
        };

        const result = await avaluacioService.upsertAvaluacio(dataToUpsert);
        res.json(result);
    } catch (error) {
        console.error("Error in upsetAvaluacioDocent:", error);
        res.status(500).json({ error: 'Error al guardar la evaluación' });
    }
};

export const getCompetencies = async (req: Request, res: Response) => {
    try {
        const competencies = await avaluacioService.getCompetencies();
        res.json(competencies);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener competencias' });
    }
};

export const analyzeObservations = async (req: Request, res: Response) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ error: 'El texto es obligatorio' });
    }
    try {
        const analysis = await avaluacioService.analyzeObservationsAI(text);
        res.json(analysis);
    } catch (error) {
        res.status(500).json({ error: 'Error al analizar las observaciones' });
    }
};
