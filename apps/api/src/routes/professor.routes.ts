import express from 'express';
const router = express.Router();
import * as professorController from '../controllers/professor.controller.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

router.get('/me/assignments', authenticateToken, professorController.getTeacherAssignments);
router.get('/centre/:idCenter', authenticateToken, professorController.getTeachersByCenter);
router.get('/', authenticateToken, professorController.getTeachers);
router.post('/', authenticateToken, professorController.createTeacher);
router.put('/:id', authenticateToken, professorController.updateTeacher);
router.delete('/:id', authenticateToken, professorController.deleteTeacher);

export default router;
