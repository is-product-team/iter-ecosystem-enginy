// apps/api/src/controllers/taller.controller.ts
import prisma from '../lib/prisma.js';
import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../lib/response.js';

// GET: Listar todos los talleres con paginación
export const getWorkshops = async (req: Request, res: Response) => {
  const { page = 1, limit = 10 } = req.query;
  const isAll = Number(limit) === 0;
  
  const skip = isAll ? undefined : (Number(page) - 1) * Number(limit);
  const take = isAll ? undefined : Number(limit);

  const [workshops, total] = await Promise.all([
    prisma.workshop.findMany({
      skip,
      take,
      include: {
        sector: true,
      },
    }),
    prisma.workshop.count(),
  ]);

  return sendSuccess(res, {
    workshops,
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: isAll ? 1 : Math.ceil(total / (take || 1)),
    },
  }, 'Workshops fetched successfully');
};

// GET: Detalle de un taller
export const getWorkshopById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const workshop = await prisma.workshop.findUnique({
    where: { id_workshop: parseInt(id as string) },
    include: {
      sector: true,
    },
  });

  if (!workshop) {
    return sendError(res, 'Workshop not found', 404);
  }
  
  return sendSuccess(res, workshop);
};

// POST: Crear Workshop
export const createWorkshop = async (req: Request, res: Response) => {
  const { titol, descripcio, durada_h, places_maximes, modalitat, id_sector, dies_execucio, icona } = req.body;

  const newWorkshop = await prisma.workshop.create({
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

  return sendSuccess(res, newWorkshop, 'Workshop created successfully', 201);
};

// PUT: Actualizar
export const updateWorkshop = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { titol, descripcio, durada_h, places_maximes, modalitat, id_sector, dies_execucio, icona } = req.body;

  const updateData: any = {};
  if (titol !== undefined) updateData.titol = titol;
  if (descripcio !== undefined) updateData.descripcio = descripcio;
  if (durada_h !== undefined) updateData.durada_h = typeof durada_h === 'string' ? parseInt(durada_h) : durada_h;
  if (places_maximes !== undefined) updateData.places_maximes = typeof places_maximes === 'string' ? parseInt(places_maximes) : places_maximes;
  if (modalitat !== undefined) updateData.modalitat = modalitat;
  if (icona !== undefined) updateData.icona = icona;
  if (id_sector !== undefined) updateData.id_sector = typeof id_sector === 'string' ? parseInt(id_sector) : id_sector;
  if (dies_execucio !== undefined) updateData.dies_execucio = dies_execucio;

  const updatedWorkshop = await prisma.workshop.update({
    where: { id_workshop: parseInt(id as string) },
    data: updateData,
  });

  return sendSuccess(res, updatedWorkshop, 'Workshop updated successfully');
};

// DELETE: Borrar
export const deleteWorkshop = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.workshop.delete({
    where: { id_workshop: parseInt(id as string) },
  });
  
  return sendSuccess(res, null, 'Workshop deleted successfully');
};
