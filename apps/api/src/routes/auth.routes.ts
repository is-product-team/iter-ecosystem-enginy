import express from 'express';
const router = express.Router();
import * as authController from '../controllers/auth.controller.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { authRateLimiter } from '../middlewares/rateLimiter.js';

// POST /api/auth/register - Registrar nuevo usuario (generalmente Admin o script semilla)
router.post('/register', authRateLimiter, authController.register);

// POST /api/auth/login - Iniciar sesión
router.post('/login', authRateLimiter, authController.login);

// POST /api/auth/logout - Cerrar sesión
router.post('/logout', authController.logout);

// GET /api/auth/me - Obtener datos del usuario actual (requiere token)
router.get('/me', authenticateToken, authController.getMe);

export default router;