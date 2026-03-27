import prisma from '../lib/prisma.js';
import { Request, Response } from 'express';

// GET: Ver notificaciones (Filtradas por centro o usuario)
export const getNotificationns = async (req: Request, res: Response) => {
  const { centreId, userId, role } = req.user! || {};

  try {
    const where: any = {
      OR: [
        // 1. Notificationnes globales (sin usuario ni centro específico)
        { id_user: null, id_center: null },

        // 2. Notificationnes para mi usuario específico
        ...(userId ? [{ id_user: userId }] : []),

        // 3. Notificationnes para mi centro
        ...(centreId ? [{ id_center: centreId }] : [])
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
      where: { id_notification: parseInt(id as string) },
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
      where: { id_notification: parseInt(id as string) }
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error en notificacioController.deleteNotification:", error);
    res.status(500).json({ error: 'Error al eliminar la notificación' });
  }
};

// Helper: Crear notificación interna (Se usará desde otros controladores)
export const createNotificationInterna = async (data: {
  id_user?: number;
  id_center?: number;
  title: string;
  message: string;
  type: 'PETICIO' | 'FASE' | 'SISTEMA';
  importance?: 'INFO' | 'WARNING' | 'URGENT';
}) => {
  try {
    const notif = await prisma.notification.create({
      data: {
        id_user: data.id_user,
        id_center: data.id_center,
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
