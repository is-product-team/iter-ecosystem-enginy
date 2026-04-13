import { Router } from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import * as certificateController from '../controllers/certificate.controller.js';

const router = Router();

router.post('/generate', authenticateToken, certificateController.generateCertificates);
router.get('/my-certificates', authenticateToken, certificateController.getMyCertificates);
router.get('/download-bulk/:assignmentId', authenticateToken, certificateController.downloadBulkCertificates);
router.get('/stats/:assignmentId', authenticateToken, certificateController.getAssignmentStats);

export default router;
