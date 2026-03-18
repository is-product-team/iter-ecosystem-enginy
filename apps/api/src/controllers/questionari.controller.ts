import { Request, Response } from 'express';
import { QuestionariService } from '../services/questionari.service.js';

const questionariService = new QuestionariService();

export const getModels = async (req: Request, res: Response) => {
    try {
        const models = await questionariService.getModels();
        res.json(models);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los modelos' });
    }
};

export const createModel = async (req: Request, res: Response) => {
    try {
        const model = await questionariService.createModel(req.body);
        res.json(model);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el modelo de cuestionario' });
    }
};

export const getModel = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const model = await questionariService.getModelById(parseInt(id as string));
        if (!model) {
            return res.status(404).json({ error: 'Modelo no encontrado' });
        }
        res.json(model);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el modelo' });
    }
};

export const trackEnviament = async (req: Request, res: Response) => {
    const { modelId, assignacioId } = req.body;
    try {
        const enviament = await questionariService.trackEnviament(modelId, assignacioId);
        res.json(enviament);
    } catch (error) {
        res.status(500).json({ error: 'Error al registrar el envío' });
    }
};

export const submitRespostes = async (req: Request, res: Response) => {
    const { enviamentId, respostes } = req.body;
    try {
        const result = await questionariService.submitRespostes(enviamentId, respostes);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Error al enviar las respuestas' });
    }
};

export const submitAutoconsulta = async (req: Request, res: Response) => {
    try {
        const result = await questionariService.submitAutoconsultaStudent(req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Error al enviar la autoevaluación' });
    }
};

export const getReports = async (req: Request, res: Response) => {
    try {
        const metrics = await questionariService.getSatisfactionMetrics();
        res.json(metrics);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener reportes' });
    }
};
