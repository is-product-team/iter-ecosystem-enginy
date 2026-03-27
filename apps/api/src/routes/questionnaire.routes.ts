import { Router } from 'express';
import {
    getModels,
    createModel,
    getModel,
    trackSubmission,
    submitResponses,
    submitAutoconsulta,
    getReports
} from '../controllers/questionnaire.controller.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/model', authenticateToken, createModel);
router.get('/models', authenticateToken, getModels);
router.get('/model/:id', authenticateToken, getModel);
router.post('/track', authenticateToken, trackSubmission);
router.post('/respond', submitResponses); // Can be anonymous if using a link
router.post('/self-consultation', authenticateToken, submitSelfConsultation);
router.get('/reports', authenticateToken, getReports);

export default router;
