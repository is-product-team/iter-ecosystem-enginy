import express from 'express';
const router = express.Router();
import * as studentController from '../controllers/student.controller.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

router.get('/', authenticateToken, studentController.getStudents);
router.post('/', authenticateToken, studentController.createStudent);
router.put('/:id', authenticateToken, studentController.updateStudent);
router.delete('/:id', authenticateToken, studentController.deleteStudent);

export default router;
