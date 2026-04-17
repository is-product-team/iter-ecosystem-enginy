import { Router } from 'express';
import * as notificationController from '../controllers/notification.controller.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();

// All routes require authentication, except for ICS sync which uses a private token
router.get('/ics/:token', notificationController.getNotificationsICS);
router.get('/', authenticateToken, notificationController.getNotifications);
router.patch('/:id/read', authenticateToken, notificationController.markAsRead);
router.delete('/:id', authenticateToken, notificationController.deleteNotification);

export default router;
