import express from 'express';
const router = express.Router();
import * as workshopController from '../controllers/workshop.controller.js';
import { authenticateToken, isAdmin } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { WorkshopSchema } from '@iter/shared';

// GET /api/workshops - List all workshops
router.get('/', workshopController.getWorkshops);

// GET /api/workshops/:id - Get workshop details
router.get('/:id', workshopController.getWorkshopById);

// POST /api/workshops - Create workshop (Admin only)
router.post('/', authenticateToken, isAdmin, validate(WorkshopSchema), workshopController.createWorkshop);

// PUT /api/workshops/:id - Update workshop
router.put('/:id', authenticateToken, isAdmin, validate(WorkshopSchema), workshopController.updateWorkshop);

// DELETE /api/workshops/:id - Delete workshop
router.delete('/:id', authenticateToken, isAdmin, workshopController.deleteWorkshop);

export default router;
