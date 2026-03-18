import express from 'express';
const router = express.Router();
import * as alumneController from '../controllers/alumne.controller.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

router.get('/', authenticateToken, alumneController.getStudents);
router.post('/', authenticateToken, alumneController.createStudent);
router.put('/:id', authenticateToken, alumneController.updateStudent);
router.delete('/:id', authenticateToken, alumneController.deleteStudent);

export default router;