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
    const profileDir = path.join('uploads', 'profile');
    const filePath = path.join(profileDir, fileName);

    if (!fs.existsSync(profileDir)) {
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
    console.error("Error uploading profile photo:", error);
    res.status(500).json({ error: 'Error processing the photo upload.' });
  }
};
