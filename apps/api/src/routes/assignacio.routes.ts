import express from 'express';
const router = express.Router();
import * as assignacioController from '../controllers/assignacio.controller.js';
import * as tetrisController from '../controllers/tetris.controller.js';
import * as enrollmentController from '../controllers/enrollment.controller.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

// /api/assignacions
router.get('/', authenticateToken, assignacioController.getAssignacions);
router.get('/:id', authenticateToken, assignacioController.getAssignacioById);
router.get('/centre/:idCentre', authenticateToken, assignacioController.getAssignacionsByCentre);
router.get('/:idAssignacio/checklist', authenticateToken, assignacioController.getChecklist);
router.get('/:idAssignacio/students', authenticateToken, assignacioController.getStudents);
router.patch('/checklist/:idItem', authenticateToken, assignacioController.updateChecklistItem);
router.get('/incidencies/centre/:idCentre', authenticateToken, assignacioController.getIncidenciesByCentre);
router.post('/incidencies', authenticateToken, assignacioController.createIncidencia);
router.post('/', authenticateToken, assignacioController.createAssignacioFromPeticio);
router.post('/:idAssignacio/inscripcions', authenticateToken, assignacioController.createInscripcions);
router.post('/auto-generate', authenticateToken, assignacioController.generateAutomaticAssignments);
router.post('/publish', authenticateToken, assignacioController.publishAssignments);
router.post('/:idAssignacio/validate', authenticateToken, assignacioController.validateCenterData);
router.patch('/inscripcions/:idInscripcio/validate', authenticateToken, assignacioController.validateInscripcioDocument);
router.post('/:idAssignacio/document-notification', authenticateToken, assignacioController.sendDocumentNotification);

// Phase 2 Specifics
router.post('/tetris', authenticateToken, tetrisController.triggerTetris);
router.post('/:idAssignacio/enrollment/excel', authenticateToken, upload.single('file'), enrollmentController.enrollStudentsViaExcel);
router.patch('/checklist/designate-profs/:idAssignacio', authenticateToken, assignacioController.designateProfessors);
router.post('/upload/validate', authenticateToken, upload.single('file'), assignacioController.validateDocumentUpload);
router.post('/:idAssignacio/compliance', authenticateToken, assignacioController.updateComplianceDocuments);
router.post('/:idAssignacio/student-document', authenticateToken, upload.single('file'), assignacioController.uploadStudentDocument);
router.post('/:idAssignacio/confirm-registration', authenticateToken, assignacioController.confirmLegalRegistration);

// Phase 2: Teaching Staff
router.post('/:idAssignacio/staff', authenticateToken, assignacioController.addTeachingStaff);
router.delete('/:idAssignacio/staff/:idUsuari', authenticateToken, assignacioController.removeTeachingStaff);

// Phase 3: Sessions & Attendance
router.get('/:idAssignacio/sessions', authenticateToken, assignacioController.getSessions);
router.get('/:idAssignacio/sessions/:sessionNum', authenticateToken, assignacioController.getSessionAttendance);
router.post('/:idAssignacio/sessions/:sessionNum', authenticateToken, assignacioController.registerAttendance);

// Phase 3: Dynamic Session Teaching Staff
router.post('/sessions/:idSessio/staff', authenticateToken, assignacioController.addSessionProfessor);
router.delete('/sessions/:idSessio/staff/:idUsuari', authenticateToken, assignacioController.removeSessionProfessor);

// Phase 4: Closing
router.post('/:idAssignacio/close', authenticateToken, assignacioController.closeAssignacio);

export default router;
