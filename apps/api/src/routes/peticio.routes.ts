import express from 'express';
const router = express.Router();
// Tendremos que crear este controlador en el siguiente paso
import * as peticioController from '../controllers/peticio.controller.js';
import { authenticateToken, isAdmin, isCoordinator } from '../middlewares/authMiddleware.js';
import { validateData } from '../middlewares/validateMiddleware.js';
import { createPeticioSchema, updatePeticioStatusSchema, updatePeticioSchema } from '../schemas/peticio.schema.js';

// GET /api/peticions - Admin ve todas, Coordinador ve las suyas
router.get('/', authenticateToken, peticioController.getRequestns);

// POST /api/peticions - Coordinador crea una solicitud
router.post('/', authenticateToken, isCoordinator, validateData(createPeticioSchema), peticioController.createRequest);

// PUT /api/peticions/:id - Coordinador edita su solicitud (si está pendiente)
router.put('/:id', authenticateToken, isCoordinator, validateData(updatePeticioSchema), peticioController.updateRequest);

// PATCH /api/peticions/:id/status - Admin aprueba/rechaza
router.patch('/:id/status', authenticateToken, isAdmin, validateData(updatePeticioStatusSchema), peticioController.updateRequestStatus);

export default router;