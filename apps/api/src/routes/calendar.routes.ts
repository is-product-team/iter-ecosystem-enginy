import { Router } from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import * as calendarController from '../controllers/calendar.controller.js';

const router = Router();

router.get('/', authenticateToken, calendarController.getCalendarEvents);
router.get('/sync/:token.ics', calendarController.getCalendarICS);

export default router;
