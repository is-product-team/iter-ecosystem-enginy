import express from 'express';
const router = express.Router();

// Import individual route files
import authRoutes from './auth.routes.js';
import workshopRoutes from './workshop.routes.js';
import centerRoutes from './center.routes.js';
import requestRoutes from './request.routes.js'; 
import assignmentRoutes from './assignment.routes.js';
import studentRoutes from './student.routes.js';
import teacherRoutes from './teacher.routes.js';
import calendarRoutes from './calendar.routes.js';
import phaseRoutes from './phase.routes.js';
import statsRoutes from './stats.routes.js';
import sectorRoutes from './sector.routes.js';
import attendanceRoutes from './attendance.routes.js';
import notificationRoutes from './notification.routes.js';
import evaluationRoutes from './evaluation.routes.js'; 
import questionnaireRoutes from './questionnaire.routes.js';
import surveyRoutes from './survey.routes.js';
import uploadRoutes from './upload.routes.js';
import profileRoutes from './profile.routes.js';

// --- Define Base Routes ---

// User/Profile Routes
router.use('/profile', profileRoutes);

// Authentication Routes (Login, Register)
router.use('/auth', authRoutes);

// Master Data Routes
router.use('/workshops', workshopRoutes);
router.use('/centers', centerRoutes);
router.use('/sectors', sectorRoutes);

// Business Flow Routes (Requests and Assignments)
router.use('/requests', requestRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/notifications', notificationRoutes);
router.use('/evaluation', evaluationRoutes); 

// Student and Teacher Routes
router.use('/students', studentRoutes);
router.use('/teachers', teacherRoutes);
router.use('/attendance', attendanceRoutes);

// Calendar Routes
router.use('/calendar', calendarRoutes);
router.use('/phases', phaseRoutes);

// Statistics Routes
router.use('/stats', statsRoutes);

// Evaluation and Questionnaire Routes
router.use('/questionnaires', questionnaireRoutes);
router.use('/surveys', surveyRoutes);

// File Upload Routes
router.use('/upload', uploadRoutes);

// Health Check
router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

export default router;
