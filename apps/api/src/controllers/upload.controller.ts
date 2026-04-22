import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import fs from 'fs';
import path from 'path';

const sanitizeFileName = (str: string) => {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9]/g, "_")    // Only letters and numbers
    .replace(/_+/g, "_")           // Remove consecutive underscores
    .replace(/(^_|_$)/g, "");      // Remove leading/trailing underscores
};

export const uploadProfilePicture = async (req: Request, res: Response) => {
  const type = req.params.type as string;
  const id = req.params.id as string;
  
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  try {
    const targetId = parseInt(id);
    let fileName = '';
    let targetName = 'profile';

    if (type === 'student') {
      const student = await prisma.student.findUnique({ where: { studentId: targetId } });
      if (!student) return res.status(404).json({ error: 'Student not found.' });
      targetName = sanitizeFileName(`${student.fullName}_${student.lastName}`);
    } else if (type === 'user') {
      const user = await prisma.user.findUnique({ where: { userId: targetId } });
      if (!user) return res.status(404).json({ error: 'User not found.' });
      targetName = sanitizeFileName(user.fullName);
    } else if (type === 'center') {
      const center = await prisma.center.findUnique({ where: { centerId: targetId } });
      if (!center) return res.status(404).json({ error: 'Center not found.' });
      targetName = sanitizeFileName(center.name);
    } else {
      return res.status(400).json({ error: 'Invalid profile type.' });
    }

    const fileExt = path.extname(req.file.originalname);
    fileName = `photo_${type}_${targetId}_${targetName}_${Date.now()}${fileExt}`;
    
    // Usar ruta absoluta para evitar problemas de contexto
    const profileDir = path.resolve(process.cwd(), 'uploads', 'profile');
    const filePath = path.join(profileDir, fileName);

    if (!fs.existsSync(profileDir)) {
      console.log(`📁 Creando directorio de perfiles: ${profileDir}`);
      fs.mkdirSync(profileDir, { recursive: true });
    }

    fs.writeFileSync(filePath, req.file.buffer);

    const url = `/uploads/profile/${fileName}`;

    if (type === 'student') {
      await prisma.student.update({
        where: { studentId: targetId },
        data: { photoUrl: url }
      });
    } else if (type === 'center') {
      await prisma.center.update({
        where: { centerId: targetId },
        data: { photoUrl: url }
      });
    } else {
      await prisma.user.update({
        where: { userId: targetId },
        data: { photoUrl: url }
      });
    }

    res.json({ success: true, photoUrl: url });
  } catch (error) {
    console.error("❌ [Upload Error] Detailed error:", error);
    res.status(500).json({ 
      error: 'Error processing the photo upload.',
      details: error instanceof Error ? error.message : String(error)
    });
  }
};

export const uploadMultimedia = async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  
  if (!files || files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded.' });
  }

  try {
    const multimediaDir = path.join('uploads', 'multimedia');
    if (!fs.existsSync(multimediaDir)) {
      fs.mkdirSync(multimediaDir, { recursive: true });
    }

    const uploadedFiles = files.map(file => {
      const fileExt = path.extname(file.originalname);
      const baseName = sanitizeFileName(path.basename(file.originalname, fileExt));
      const fileName = `media_${baseName}_${Date.now()}${fileExt}`;
      const filePath = path.join(multimediaDir, fileName);

      fs.writeFileSync(filePath, file.buffer);

      return {
        fileName: file.originalname,
        fileUrl: `/uploads/multimedia/${fileName}`,
        fileType: file.mimetype,
        fileSize: file.size
      };
    });

    res.json({ success: true, files: uploadedFiles });
  } catch (error) {
    console.error("Error uploading multimedia:", error);
    res.status(500).json({ error: 'Error processing the multimedia upload.' });
  }
};
