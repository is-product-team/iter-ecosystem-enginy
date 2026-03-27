import express from 'express';
const router = express.Router();
import * as centerController from '../controllers/center.controller.js';
import { authenticateToken, isAdmin } from '../middlewares/authMiddleware.js';
import { validateData } from '../middlewares/validateMiddleware.js';
import { createCenterSchema, updateCenterSchema } from '../schemas/center.schema.js';

router.get('/', authenticateToken, centerController.getCenters);
router.get('/:id', authenticateToken, centerController.getCenterById);
router.post('/', authenticateToken, isAdmin, validateData(createCenterSchema), centerController.createCenter);
router.patch('/:id', authenticateToken, isAdmin, validateData(updateCenterSchema), centerController.updateCenter);
router.delete('/:id', authenticateToken, isAdmin, centerController.deleteCenter);

export default router;
