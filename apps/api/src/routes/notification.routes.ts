import { Router } from 'express';
import * as notificationController from '../controllers/notification.controller.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();

// All routes require authentication
router.get('/', authenticateToken, notificationController.getNotifications);
router.patch('/:id/read', authenticateToken, notificationController.markAsRead);
router.delete('/:id', authenticateToken, notificationController.deleteNotification);

export default router;
