import { Router } from 'express';
import {
    getInscripcioEvaluation,
    upsertEvaluation,
    getCompetencies,
    analyzeObservations,
    processVoiceEvaluation
} from '../controllers/evaluation.controller.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/enrollment/:id', authenticateToken, getInscripcioEvaluation);
router.post('/upsert', authenticateToken, upsertEvaluation);
router.get('/competencies', authenticateToken, getCompetencies);
router.post('/analyze', authenticateToken, analyzeObservations);
router.post('/voice-process', authenticateToken, processVoiceEvaluation);

export default router;
