import express from 'express';
import * as statsController from '../controllers/stats.controller';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/status', statsController.getStatsByStatus);
router.get('/popular', statsController.getPopularWorkshops);
router.get('/activity', statsController.getRecentActivity);
router.delete('/logs/cleanup', statsController.cleanupLogs);
router.get('/monitor-phase2', authenticateToken, statsController.getPhase2MonitoringStats);
router.post('/risk-analysis', statsController.runRiskAnalysis);

export default router;
