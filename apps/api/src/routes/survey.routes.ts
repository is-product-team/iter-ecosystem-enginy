import { Router } from 'express';
// import { authenticateToken } from '../middlewares/authMiddleware.js'; // If auth is required
import * as surveyController from '../controllers/survey.controller.js';

const router = Router();

// Public (access by token)
router.get('/token/:token', surveyController.getSurveyByToken);
router.post('/token/:token', surveyController.submitSurvey);

// Private (Admin/Coordinator) - Manual generation if necessary
// router.post('/generate', authenticateToken, surveyController.generateSurveys);

export default router;
