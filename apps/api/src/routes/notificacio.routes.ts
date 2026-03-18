import { Router } from 'express';
import * as notificacioController from '../controllers/notificacio.controller.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();

// Todas las rutas requieren autenticación
router.get('/', authenticateToken, notificacioController.getNotificacions);
router.patch('/:id/read', authenticateToken, notificacioController.markAsRead);
router.delete('/:id', authenticateToken, notificacioController.deleteNotificacio);

export default router;
