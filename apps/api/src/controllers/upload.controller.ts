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
      const alumne = await prisma.alumne.findUnique({ where: { id_alumne: targetId } });
      if (!alumne) return res.status(404).json({ error: 'Alumne no trobat.' });
      targetName = sanitizeFileName(`${alumne.nom}_${alumne.cognoms}`);
    } else if (type === 'usuari') {
      const usuari = await prisma.usuari.findUnique({ where: { id_usuari: targetId } });
      if (!usuari) return res.status(404).json({ error: 'Usuari no trobat.' });
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
      await prisma.alumne.update({
        where: { id_alumne: targetId },
        data: { url_foto: url }
      });
    } else {
      await prisma.usuari.update({
        where: { id_usuari: targetId },
        data: { url_foto: url }
      });
    }

    res.json({ success: true, url_foto: url });
  } catch (error) {
    console.error("Error al pujar foto de perfil:", error);
    res.status(500).json({ error: 'Error al processar la pujada de la foto.' });
  }
};
