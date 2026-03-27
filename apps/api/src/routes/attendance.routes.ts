import express from 'express';
const router = express.Router();
import * as attendanceController from '../controllers/attendance.controller.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

// /api/attendance
router.post('/', authenticateToken, attendanceController.registerAttendance);
router.get('/assignment/:idAssignment', authenticateToken, attendanceController.getAttendanceByAssignment);

export default router;
