import prisma from '../lib/prisma.js';
import { Request, Response } from 'express';

// GET: View notifications (Filtered by center or user)
export const getNotifications = async (req: Request, res: Response) => {
  const { centerId, userId } = req.user! || {};

  try {
    const where: any = {
      OR: [
        // 1. Global notifications (no specific user or center)
        { userId: null, centerId: null },

        // 2. Notifications for my specific user
        ...(userId ? [{ userId: userId }] : []),

        // 3. Notifications for my center
        ...(centerId ? [{ centerId: centerId }] : [])
      ]
    };

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    });

    res.json(notifications);
  } catch (error) {
    console.error("Error in notification.controller.getNotifications:", error);
    res.status(500).json({ error: 'Failed to retrieve notifications' });
  }
};

// PATCH: Mark as read
export const markAsRead = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const updated = await prisma.notification.update({
      where: { notificationId: parseInt(id as string) },
      data: { isRead: true }
    });

    res.json(updated);
  } catch (error) {
    console.error("Error in notification.controller.markAsRead:", error);
    res.status(500).json({ error: 'Failed to mark the notification as read' });
  }
};

// DELETE: Delete notification
export const deleteNotification = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.notification.delete({
      where: { notificationId: parseInt(id as string) }
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error in notification.controller.deleteNotification:", error);
    res.status(500).json({ error: 'Failed to delete the notification' });
  }
};

// Helper: Create internal notification (To be used from other controllers)
export const createNotificationInternal = async (data: {
  userId?: number;
  centerId?: number;
  title: string;
  message: string;
  type: 'REQUEST' | 'PHASE' | 'SYSTEM';
  importance?: 'INFO' | 'WARNING' | 'URGENT';
}) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        centerId: data.centerId,
        title: data.title,
        message: data.message,
        type: data.type,
        importance: data.importance || 'INFO'
      }
    });

    return notification;
  } catch (error) {
    console.error("Error creating internal notification:", error);
  }
};
