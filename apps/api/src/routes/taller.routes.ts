import express from 'express';
const router = express.Router();
import * as tallerController from '../controllers/taller.controller.js';
import { authenticateToken, isAdmin } from '../middlewares/authMiddleware.js';
import { validateData } from '../middlewares/validateMiddleware.js';
import { createTallerSchema, updateTallerSchema } from '../schemas/taller.schema.js';

// GET /api/tallers - Listar todos los talleres
router.get('/', tallerController.getTallers);

// GET /api/tallers/:id - Detalle de un taller
router.get('/:id', tallerController.getTallerById);

// POST /api/tallers - Crear taller (Solo Admin)
router.post('/', authenticateToken, isAdmin, validateData(createTallerSchema), tallerController.createTaller);

// PUT /api/tallers/:id - Editar taller
router.put('/:id', authenticateToken, isAdmin, validateData(updateTallerSchema), tallerController.updateTaller);

// DELETE /api/tallers/:id - Borrar taller
router.delete('/:id', authenticateToken, isAdmin, tallerController.deleteTaller);

export default router;
