import express from 'express';
const router = express.Router();
import * as evaluationController from '../controllers/evaluation.controller.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

router.post('/voice-process', authenticateToken, evaluationController.processVoiceEvaluation);

export default router;
