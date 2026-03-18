// apps/api/src/controllers/taller.controller.ts
import prisma from '../lib/prisma.js'; // Importamos nuestro cliente singleton
import { Request, Response } from 'express';

// GET: Listar todos los talleres con paginación
export const getTallers = async (req: Request, res: Response) => {
  const { page = 1, limit = 10 } = req.query;
  const isAll = Number(limit) === 0;
  
  const skip = isAll ? undefined : (Number(page) - 1) * Number(limit);
  const take = isAll ? undefined : Number(limit);

  const [tallers, total] = await Promise.all([
    prisma.taller.findMany({
      skip,
      take,
      include: {
        sector: true,
      },
    }),
    prisma.taller.count(),
  ]);

  res.json({
    data: tallers,
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: isAll ? 1 : Math.ceil(total / (take || 1)),
    },
  });
};

// GET: Detalle de un taller
export const getTallerById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const taller = await prisma.taller.findUnique({
    where: { id_taller: parseInt(id as string) },
    include: {
      sector: true,
    },
  });

  if (!taller) return res.status(404).json({ error: 'Taller no trobat' });
  res.json(taller);
};

// POST: Crear Taller
export const createTaller = async (req: Request, res: Response) => {
  const { titol, descripcio, durada_h, places_maximes, modalitat, id_sector, dies_execucio, icona } = req.body;

  try {
    const nuevoTaller = await prisma.taller.create({
      data: {
        titol,
        descripcio: descripcio || "",
        durada_h: typeof durada_h === 'string' ? parseInt(durada_h) : (durada_h || 0),
        places_maximes: typeof places_maximes === 'string' ? parseInt(places_maximes) : (places_maximes || 25),
        modalitat: modalitat || 'A',
        icona: icona || "🧩",
        id_sector: id_sector ? (typeof id_sector === 'string' ? parseInt(id_sector) : id_sector) : 1,
        dies_execucio: dies_execucio || []
      },
    });
    res.status(201).json(nuevoTaller);
  } catch (error) {
    console.error("Error en createTaller:", error);
    res.status(500).json({ error: 'Error al crear el taller' });
  }
};

// PUT: Actualizar
export const updateTaller = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { titol, descripcio, durada_h, places_maximes, modalitat, id_sector, dies_execucio, icona } = req.body;

  try {
    const updateData: any = {};
    if (titol !== undefined) updateData.titol = titol;
    if (descripcio !== undefined) updateData.descripcio = descripcio;
    if (durada_h !== undefined) updateData.durada_h = typeof durada_h === 'string' ? parseInt(durada_h) : durada_h;
    if (places_maximes !== undefined) updateData.places_maximes = typeof places_maximes === 'string' ? parseInt(places_maximes) : places_maximes;
    if (modalitat !== undefined) updateData.modalitat = modalitat;
    if (icona !== undefined) updateData.icona = icona;
    if (id_sector !== undefined) updateData.id_sector = typeof id_sector === 'string' ? parseInt(id_sector) : id_sector;
    if (dies_execucio !== undefined) updateData.dies_execucio = dies_execucio;

    const tallerActualizado = await prisma.taller.update({
      where: { id_taller: parseInt(id as string) },
      data: updateData,
    });
    res.json(tallerActualizado);
  } catch (error) {
    console.error("Error en updateTaller:", error);
    res.status(500).json({ error: 'Error al actualitzar el taller' });
  }
};

// DELETE: Borrar
export const deleteTaller = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.taller.delete({
    where: { id_taller: parseInt(id as string) },
  });
  res.json({ message: 'Taller eliminat correctament' });
};