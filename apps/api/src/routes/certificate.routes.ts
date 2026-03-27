import { Router } from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import * as certificateController from '../controllers/certificate.controller.js';

const router = Router();

router.post('/generate', authenticateToken, certificateController.generateCertificates);
router.get('/my-certificates', authenticateToken, certificateController.getMyCertificates);

export default router;
