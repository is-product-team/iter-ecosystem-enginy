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
    let targetName = 'perfil';

    if (type === 'alumne') {
      const alumne = await prisma.student.findUnique({ where: { id_student: targetId } });
      if (!alumne) return res.status(404).json({ error: 'Student no trobat.' });
      targetName = sanitizeFileName(`${alumne.nom}_${alumne.cognoms}`);
    } else if (type === 'usuari') {
      const usuari = await prisma.user.findUnique({ where: { id_user: targetId } });
      if (!usuari) return res.status(404).json({ error: 'User no trobat.' });
      targetName = sanitizeFileName(usuari.nom_complet);
    } else {
      return res.status(400).json({ error: 'Tipus de perfil no vàlid.' });
    }

    const fileExt = path.extname(req.file.originalname);
    fileName = `foto_${type}_${targetId}_${targetName}_${Date.now()}${fileExt}`;
    const profileDir = path.join('uploads', 'perfil');
    const filePath = path.join(profileDir, fileName);

    if (!fs.existsSync(profileDir)) {
      fs.mkdirSync(profileDir, { recursive: true });
    }

    fs.writeFileSync(filePath, req.file.buffer);

    const url = `/uploads/perfil/${fileName}`;

    if (type === 'alumne') {
      await prisma.student.update({
        where: { id_student: targetId },
        data: { url_foto: url }
      });
    } else {
      await prisma.user.update({
        where: { id_user: targetId },
        data: { url_foto: url }
      });
    }

    res.json({ success: true, url_foto: url });
  } catch (error) {
    console.error("Error al pujar foto de perfil:", error);
    res.status(500).json({ error: 'Error al processar la pujada de la foto.' });
  }
};
