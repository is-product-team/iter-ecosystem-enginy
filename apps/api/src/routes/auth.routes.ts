import express from 'express';
const router = express.Router();
import * as authController from '../controllers/auth.controller.js';

// POST /api/auth/register - Registrar nuevo usuario (generalmente Admin o script semilla)
router.post('/register', authController.register);

// POST /api/auth/login - Iniciar sesión
router.post('/login', authController.login);

// GET /api/auth/me - Obtener datos del usuario actual (requiere token)
// router.get('/me', authMiddleware, authController.getMe);

export default router;