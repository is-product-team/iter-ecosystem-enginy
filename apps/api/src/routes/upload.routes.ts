import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import * as uploadController from '../controllers/upload.controller.js';

const router = express.Router();

// Configuración de Multer para memoria (mismo que en otros controllers)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Només es permeten fitxers d\'imatge.'));
    }
  }
});

router.post('/profile/:type/:id', authenticateToken, upload.single('foto'), uploadController.uploadProfilePicture);

export default router;
