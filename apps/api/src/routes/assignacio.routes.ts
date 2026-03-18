import express from 'express';
const router = express.Router();
import * as assignmentController from '../controllers/assignacio.controller.js';
import * as tetrisController from '../controllers/tetris.controller.js';
import * as enrollmentController from '../controllers/enrollment.controller.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

// /api/assignacions
router.get('/', authenticateToken, assignmentController.getAssignments);
router.get('/:id', authenticateToken, assignmentController.getAssignmentById);
router.get('/center/:idCenter', authenticateToken, assignmentController.getAssignmentsByCenter);
router.get('/:idAssignment/checklist', authenticateToken, assignmentController.getChecklist);
router.get('/:idAssignment/students', authenticateToken, assignmentController.getStudents);
router.patch('/checklist/:idItem', authenticateToken, assignmentController.updateChecklistItem);
router.get('/issues/center/:idCenter', authenticateToken, assignmentController.getIssuesByCenter);
router.post('/issues', authenticateToken, assignmentController.createIssue);
router.post('/', authenticateToken, assignmentController.createAssignmentFromRequest);
router.post('/:idAssignment/enrollments', authenticateToken, assignmentController.createEnrollments);
router.post('/auto-generate', authenticateToken, assignmentController.generateAutomaticAssignments);
router.post('/publish', authenticateToken, assignmentController.publishAssignments);
router.post('/:idAssignment/validate', authenticateToken, assignmentController.validateCenterData);
router.patch('/enrollments/:idEnrollment/validate', authenticateToken, assignmentController.validateEnrollmentDocument);
router.post('/:idAssignment/document-notification', authenticateToken, assignmentController.sendDocumentNotification);

// Phase 2 Specifics
router.post('/tetris', authenticateToken, tetrisController.triggerTetris);
router.post('/:idAssignment/enrollment/excel', authenticateToken, upload.single('file'), enrollmentController.enrollStudentsViaExcel);
router.patch('/checklist/designate-teachers/:idAssignment', authenticateToken, assignmentController.designateTeachers);
router.post('/upload/validate', authenticateToken, upload.single('file'), assignmentController.validateDocumentUpload);
router.post('/:idAssignment/compliance', authenticateToken, assignmentController.updateComplianceDocuments);
router.post('/:idAssignment/student-document', authenticateToken, upload.single('file'), assignmentController.uploadStudentDocument);
router.post('/:idAssignment/confirm-registration', authenticateToken, assignmentController.confirmLegalRegistration);

// Phase 2: Teaching Staff
router.post('/:idAssignment/staff', authenticateToken, assignmentController.addTeachingStaff);
router.delete('/:idAssignment/staff/:idUser', authenticateToken, assignmentController.removeTeachingStaff);

// Phase 3: Sessions & Attendance
router.get('/:idAssignment/sessions', authenticateToken, assignmentController.getSessions);
router.get('/:idAssignment/sessions/:sessionNum', authenticateToken, assignmentController.getSessionAttendance);
router.post('/:idAssignment/sessions/:sessionNum', authenticateToken, assignmentController.registerAttendance);

// Phase 3: Dynamic Session Teaching Staff
router.post('/sessions/:idSession/staff', authenticateToken, assignmentController.addSessionTeacher);
router.delete('/sessions/:idSession/staff/:idUser', authenticateToken, assignmentController.removeSessionTeacher);

// Phase 4: Closing
router.post('/:idAssignment/close', authenticateToken, assignmentController.closeAssignment);

export default router;
