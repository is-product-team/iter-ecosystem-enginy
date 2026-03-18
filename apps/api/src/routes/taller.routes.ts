import express from 'express';
const router = express.Router();
import * as workshopController from '../controllers/taller.controller.js';
import { authenticateToken, isAdmin } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { WorkshopSchema } from '@iter/shared';

// GET /api/workshops - Listar todos los talleres
router.get('/', workshopController.getWorkshops);

// GET /api/workshops/:id - Detalle de un taller
router.get('/:id', workshopController.getWorkshopById);

// POST /api/workshops - Crear taller (Solo Admin)
router.post('/', authenticateToken, isAdmin, validate(WorkshopSchema), workshopController.createWorkshop);

// PUT /api/workshops/:id - Editar taller
router.put('/:id', authenticateToken, isAdmin, validate(WorkshopSchema), workshopController.updateWorkshop);

// DELETE /api/workshops/:id - Borrar taller
router.delete('/:id', authenticateToken, isAdmin, workshopController.deleteWorkshop);

export default router;
