import express from 'express';
const router = express.Router();
import * as teacherController from '../controllers/teacher.controller.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

router.get('/me/assignments', authenticateToken, teacherController.getTeacherAssignments);
router.get('/center/:centerId', authenticateToken, teacherController.getTeachersByCenter);
router.get('/', authenticateToken, teacherController.getTeachers);
router.post('/', authenticateToken, teacherController.createTeacher);
router.put('/:id', authenticateToken, teacherController.updateTeacher);
router.delete('/:id', authenticateToken, teacherController.deleteTeacher);

export default router;
