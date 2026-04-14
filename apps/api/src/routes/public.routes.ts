import { Router } from 'express';
import * as publicController from '../controllers/public.controller.js';

const router = Router();

/**
 * Public routes (No authentication required)
 */

router.get('/surveys/verify', publicController.verifyStudentForSurvey);
router.post('/surveys/submit', publicController.submitPublicSurvey);

export default router;
