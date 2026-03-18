import express from 'express';
const router = express.Router();
import * as alumneController from '../controllers/alumne.controller.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

router.get('/', authenticateToken, alumneController.getAlumnes);
router.post('/', authenticateToken, alumneController.createAlumne);
router.put('/:id', authenticateToken, alumneController.updateAlumne);
router.delete('/:id', authenticateToken, alumneController.deleteAlumne);

export default router;