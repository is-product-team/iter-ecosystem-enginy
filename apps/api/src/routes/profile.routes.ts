import { Router } from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import * as profileController from '../controllers/profile.controller.js';

const router = Router();

router.get('/sync-token', authenticateToken, profileController.getSyncToken);
router.post('/sync-token', authenticateToken, profileController.generateSyncToken);

export default router;
