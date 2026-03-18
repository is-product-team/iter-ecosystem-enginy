import { Router } from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import * as calendarController from '../controllers/calendar.controller.js';

const router = Router();

router.get('/', authenticateToken, calendarController.getCalendarEvents);

export default router;
