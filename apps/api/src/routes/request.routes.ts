import express from 'express';
const router = express.Router();
import * as requestController from '../controllers/request.controller.js';
import { authenticateToken, isAdmin, isCoordinator } from '../middlewares/authMiddleware.js';
import { validateData } from '../middlewares/validateMiddleware.js';
import { createRequestSchema, updateRequestStatusSchema, updateRequestSchema } from '../schemas/request.schema.js';

// GET /api/requests - Admin sees all, Coordinator sees their own
router.get('/', authenticateToken, requestController.getRequests);

// POST /api/requests - Coordinator creates a request
router.post('/', authenticateToken, isCoordinator, validateData(createRequestSchema), requestController.createRequest);

// PUT /api/requests/:id - Coordinator edits their request (if pending)
router.put('/:id', authenticateToken, isCoordinator, validateData(updateRequestSchema), requestController.updateRequest);

// PATCH /api/requests/:id/status - Admin approves/rejects
router.patch('/:id/status', authenticateToken, isAdmin, validateData(updateRequestStatusSchema), requestController.updateRequestStatus);

export default router;
