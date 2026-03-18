import { Router } from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import * as certificatController from '../controllers/certificat.controller.js';

const router = Router();

router.post('/generate', authenticateToken, certificatController.generateCertificates);
router.get('/my-certificates', authenticateToken, certificatController.getMyCertificates);

export default router;
