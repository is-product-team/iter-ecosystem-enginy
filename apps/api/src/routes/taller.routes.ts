import express from 'express';
const router = express.Router();
import * as tallerController from '../controllers/taller.controller';
import { authenticateToken, isAdmin } from '../middlewares/authMiddleware';
import { validateData } from '../middlewares/validateMiddleware';
import { createTallerSchema, updateTallerSchema } from '../schemas/taller.schema';

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
