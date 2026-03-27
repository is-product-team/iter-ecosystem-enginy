import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import fs from 'fs';
import path from 'path';

const sanitizeFileName = (str: string) => {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Treure accents
    .replace(/[^a-z0-9]/g, "_")    // Només lletres i números
    .replace(/_+/g, "_")           // Treure guions baixos consecutius
    .replace(/(^_|_$)/g, "");      // Treure guions baixos a l'inici o final
};

export const uploadProfilePicture = async (req: Request, res: Response) => {
  const type = req.params.type as string;
  const id = req.params.id as string;
  
  if (!req.file) {
    return res.status(400).json({ error: 'No s\'ha pujat cap fitxer.' });
  }

  try {
    const targetId = parseInt(id);
    let fileName = '';
    let targetName = 'profile';

    if (type === 'student') {
      const alumne = await prisma.student.findUnique({ where: { studentId: targetId } });
      if (!alumne) return res.status(404).json({ error: 'Student no trobat.' });
      targetName = sanitizeFileName(`${alumne.fullName}_${alumne.lastName}`);
    } else if (type === 'user') {
      const usuari = await prisma.user.findUnique({ where: { userId: targetId } });
      if (!usuari) return res.status(404).json({ error: 'User no trobat.' });
      targetName = sanitizeFileName(usuari.fullName);
    } else {
      return res.status(400).json({ error: 'Tipus de perfil no vàlid.' });
    }

    const fileExt = path.extname(req.file.originalname);
    fileName = `foto_${type}_${targetId}_${targetName}_${Date.now()}${fileExt}`;
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
    } else {
      await prisma.user.update({
        where: { userId: targetId },
        data: { photoUrl: url }
      });
    }

    res.json({ success: true, photoUrl: url });
  } catch (error) {
    console.error("Error al pujar foto de perfil:", error);
    res.status(500).json({ error: 'Error al processar la pujada de la foto.' });
  }
};
