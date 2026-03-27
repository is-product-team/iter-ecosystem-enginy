import { Request, Response } from 'express';
import { QuestionnaireService } from '../services/questionnaire.service.js';

const questionnaireService = new QuestionnaireService();

export const getModels = async (req: Request, res: Response) => {
    try {
        const models = await questionnaireService.getModels();
        res.json(models);
    } catch (error) {
        console.error("Error in questionnaire.controller.getModels:", error);
        res.status(500).json({ error: 'Failed to retrieve questionnaire models' });
    }
};

export const createModel = async (req: Request, res: Response) => {
    try {
        const model = await questionnaireService.createModel(req.body);
        res.json(model);
    } catch (error) {
        console.error("Error in questionnaire.controller.createModel:", error);
        res.status(500).json({ error: 'Failed to create questionnaire model' });
    }
};

export const getModel = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const model = await questionnaireService.getModelById(parseInt(id as string));
        if (!model) {
            return res.status(404).json({ error: 'Questionnaire model not found' });
        }
        res.json(model);
    } catch (error) {
        console.error("Error in questionnaire.controller.getModel:", error);
        res.status(500).json({ error: 'Failed to retrieve questionnaire model' });
    }
};

export const trackSubmission = async (req: Request, res: Response) => {
    const { assignmentId, target } = req.body;
    try {
        const submission = await questionnaireService.trackSubmission(assignmentId, target);
        res.json(submission);
    } catch (error) {
        console.error("Error in questionnaire.controller.trackSubmission:", error);
        res.status(500).json({ error: 'Failed to track the submission' });
    }
};

export const submitResponses = async (req: Request, res: Response) => {
    const { token, responses } = req.body;
    try {
        const result = await questionnaireService.submitResponses(token, responses);
        res.json(result);
    } catch (error) {
        console.error("Error in questionnaire.controller.submitResponses:", error);
        res.status(500).json({ error: 'Failed to submit responses' });
    }
};

export const submitSelfConsultation = async (req: Request, res: Response) => {
    try {
        const result = await questionnaireService.submitStudentSelfConsultation(req.body);
        res.json(result);
    } catch (error) {
        console.error("Error in questionnaire.controller.submitSelfConsultation:", error);
        res.status(500).json({ error: 'Failed to submit student self-consultation' });
    }
};

export const getReports = async (req: Request, res: Response) => {
    try {
        const metrics = await questionnaireService.getSatisfactionMetrics();
        res.json(metrics);
    } catch (error) {
        console.error("Error in questionnaire.controller.getReports:", error);
        res.status(500).json({ error: 'Failed to retrieve satisfaction reports' });
    }
};
