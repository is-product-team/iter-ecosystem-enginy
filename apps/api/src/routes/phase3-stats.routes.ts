import express from 'express';
const router = express.Router();
import * as statsController from '../controllers/phase3-stats.controller.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

// Base: /api/phase3
router.get('/center/:centerId/stats', authenticateToken, statsController.getCenterPhase3Stats);
router.post('/incidents', authenticateToken, statsController.createLinkedIncident);

export default router;
