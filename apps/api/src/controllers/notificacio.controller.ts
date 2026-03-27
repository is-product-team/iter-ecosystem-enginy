import prisma from '../lib/prisma.js';
import { Request, Response } from 'express';

// GET: Ver notificaciones (Filtradas por centro o usuario)
export const getNotificationns = async (req: Request, res: Response) => {
  const { centreId, userId, role } = req.user! || {};

  try {
    const where: any = {
      OR: [
        // 1. Notificationnes globales (sin usuario ni centro específico)
        { userId: null, centerId: null },

        // 2. Notificationnes para mi usuario específico
        ...(userId ? [{ userId: userId }] : []),

        // 3. Notificationnes para mi centro
        ...(centreId ? [{ centerId: centreId }] : [])
      ]
    };

    const notificacions = await prisma.notification.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    });

    res.json(notificacions);
  } catch (error) {
    console.error("Error en notificacioController.getNotificationns:", error);
    res.status(500).json({ error: 'Error al obtener notificaciones' });
  }
};

// PATCH: Marcar como leída
export const markAsRead = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const updated = await prisma.notification.update({
      where: { notificationId: parseInt(id as string) },
      data: { isRead: true }
    });

    res.json(updated);
  } catch (error) {
    console.error("Error en notificacioController.markAsRead:", error);
    res.status(500).json({ error: 'Error al marcar la notificación como leída' });
  }
};

// DELETE: Eliminar notificación
export const deleteNotification = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.notification.delete({
      where: { notificationId: parseInt(id as string) }
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error en notificacioController.deleteNotification:", error);
    res.status(500).json({ error: 'Error al eliminar la notificación' });
  }
};

// Helper: Crear notificación interna (Se usará desde otros controladores)
export const createNotificationInterna = async (data: {
  userId?: number;
  centerId?: number;
  title: string;
  message: string;
  type: 'REQUEST' | 'PHASE' | 'SYSTEM';
  importance?: 'INFO' | 'WARNING' | 'URGENT';
}) => {
  try {
    const notif = await prisma.notification.create({
      data: {
        userId: data.userId,
        centerId: data.centerId,
        title: data.title,
        message: data.message,
        type: data.type,
        importance: data.importance || 'INFO'
      }
    });

    return notif;
  } catch (error) {
    console.error("Error creando notificación interna:", error);
  }
};
