import express from 'express';
const router = express.Router();
import * as assistenciaController from '../controllers/assistencia.controller.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

// /api/assistencia
router.post('/', authenticateToken, assistenciaController.registerAssistencia);
router.get('/assignacio/:idAssignacio', authenticateToken, assistenciaController.getAssistenciaByAssignacio);

export default router;
