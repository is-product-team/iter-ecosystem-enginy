import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import * as uploadController from '../controllers/upload.controller.js';

const router = express.Router();

// Configuración de Multer para memoria (mismo que en otros controllers)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB for videos
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/', 'video/', 'application/pdf'];
    if (allowedTypes.some(type => file.mimetype.startsWith(type))) {
      cb(null, true);
    } else {
      cb(new Error('File type not supported. Allowed: Images, Videos, PDFs.'));
    }
  }
});

router.post('/profile/:type/:id', authenticateToken, upload.single('photo'), uploadController.uploadProfilePicture);
router.post('/multimedia', authenticateToken, upload.array('files', 5), uploadController.uploadMultimedia);

export default router;
