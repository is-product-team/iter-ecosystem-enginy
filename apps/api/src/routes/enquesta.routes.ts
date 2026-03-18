import { Router } from 'express';
// import { authenticateToken } from '../middlewares/authMiddleware.js'; // Si se requiere auth
import * as enquestaController from '../controllers/enquesta.controller.js';

const router = Router();

// Públicas (acceso por token)
router.get('/token/:token', enquestaController.getEnquestaByToken);
router.post('/token/:token', enquestaController.submitEnquesta);

// Privadas (Admin/Coordinador) - Generación manual si fuera necesaria
// router.post('/generate', authenticateToken, enquestaController.generateEnquestes);

export default router;
