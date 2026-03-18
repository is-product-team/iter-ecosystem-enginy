import express from 'express';
const router = express.Router();
import * as centroController from '../controllers/centro.controller.js';
import { authenticateToken, isAdmin } from '../middlewares/authMiddleware.js';
import { validateData } from '../middlewares/validateMiddleware.js';
import { createCentreSchema, updateCentreSchema } from '../schemas/centro.schema.js';

router.get('/', authenticateToken, centroController.getCentres);
router.get('/:id', authenticateToken, centroController.getCentreById);
router.post('/', authenticateToken, isAdmin, validateData(createCentreSchema), centroController.createCentre);
router.patch('/:id', authenticateToken, isAdmin, validateData(updateCentreSchema), centroController.updateCentre);
router.delete('/:id', authenticateToken, isAdmin, centroController.deleteCentre);

export default router;