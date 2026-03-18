import express from 'express';
const router = express.Router();
import * as assistenciaController from '../controllers/assistencia.controller.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

// /api/assistencia
router.post('/', authenticateToken, assistenciaController.registerAttendance);
router.get('/assignacio/:idAssignment', authenticateToken, assistenciaController.getAttendanceByAssignment);

export default router;
