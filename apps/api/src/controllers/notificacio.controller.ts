import prisma from '../lib/prisma';
import { Request, Response } from 'express';

// GET: Ver notificaciones (Filtradas por centro o usuario)
export const getNotificacions = async (req: Request, res: Response) => {
  const { centreId, userId, role } = (req as any).user || {};

  try {
    const where: any = {
      OR: [
        // 1. Notificaciones globales (sin usuario ni centro específico)
        { id_usuari: null, id_centre: null },
        
        // 2. Notificaciones para mi usuario específico
        ...(userId ? [{ id_usuari: userId }] : []),
        
        // 3. Notificaciones para mi centro
        ...(centreId ? [{ id_centre: centreId }] : [])
      ]
    };

    const notificacions = await prisma.notificacio.findMany({
      where,
      orderBy: {
        data_creacio: 'desc'
      },
      take: 50
    });

    res.json(notificacions);
  } catch (error) {
    console.error("Error en notificacioController.getNotificacions:", error);
    res.status(500).json({ error: 'Error al obtener notificaciones' });
  }
};

// PATCH: Marcar como leída
export const markAsRead = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const updated = await prisma.notificacio.update({
      where: { id_notificacio: parseInt(id as string) },
      data: { llegida: true }
    });

    res.json(updated);
  } catch (error) {
    console.error("Error en notificacioController.markAsRead:", error);
    res.status(500).json({ error: 'Error al marcar la notificación como leída' });
  }
};

// DELETE: Eliminar notificación
export const deleteNotificacio = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.notificacio.delete({
      where: { id_notificacio: parseInt(id as string) }
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error en notificacioController.deleteNotificacio:", error);
    res.status(500).json({ error: 'Error al eliminar la notificación' });
  }
};

// Helper: Crear notificación interna (Se usará desde otros controladores)
export const createNotificacioInterna = async (data: {
  id_usuari?: number;
  id_centre?: number;
  titol: string;
  missatge: string;
  tipus: 'PETICIO' | 'FASE' | 'SISTEMA';
  importancia?: 'INFO' | 'WARNING' | 'URGENT';
}) => {
  try {
    const notif = await prisma.notificacio.create({
      data: {
        id_usuari: data.id_usuari,
        id_centre: data.id_centre,
        titol: data.titol,
        missatge: data.missatge,
        tipus: data.tipus,
        importancia: data.importancia || 'INFO'
      }
    });

    return notif;
  } catch (error) {
    console.error("Error creando notificación interna:", error);
  }
};
