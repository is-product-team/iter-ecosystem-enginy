import express from 'express';
const router = express.Router();
import * as centroController from '../controllers/centro.controller.js';
import { authenticateToken, isAdmin } from '../middlewares/authMiddleware.js';
import { validateData } from '../middlewares/validateMiddleware.js';
import { createCenterSchema, updateCenterSchema } from '../schemas/centro.schema.js';

router.get('/', authenticateToken, centroController.getCenters);
router.get('/:id', authenticateToken, centroController.getCenterById);
router.post('/', authenticateToken, isAdmin, validateData(createCenterSchema), centroController.createCenter);
router.patch('/:id', authenticateToken, isAdmin, validateData(updateCenterSchema), centroController.updateCenter);
router.delete('/:id', authenticateToken, isAdmin, centroController.deleteCenter);

export default router;