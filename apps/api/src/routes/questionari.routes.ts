import { Router } from 'express';
import {
    getModels,
    createModel,
    getModel,
    trackEnviament,
    submitRespostes,
    submitAutoconsulta,
    getReports
} from '../controllers/questionari.controller.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/model', authenticateToken, createModel);
router.get('/models', authenticateToken, getModels);
router.get('/model/:id', authenticateToken, getModel);
router.post('/track', authenticateToken, trackEnviament);
router.post('/respond', submitRespostes); // Puede ser anónimo o sin auth si es por link
router.post('/autoconsulta', authenticateToken, submitAutoconsulta);
router.get('/reports', authenticateToken, getReports);

export default router;
