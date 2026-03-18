import { Router } from 'express';
import {
    getAvaluacioInscripcio,
    upsetAvaluacioDocent,
    getCompetencies,
    analyzeObservations
} from '../controllers/avaluacio.controller.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/inscripcio/:id', authenticateToken, getAvaluacioInscripcio);
router.post('/upset', authenticateToken, upsetAvaluacioDocent);
router.get('/competencies', authenticateToken, getCompetencies);
router.post('/analyze', authenticateToken, analyzeObservations);

export default router;
