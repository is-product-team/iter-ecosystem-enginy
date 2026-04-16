import prisma from '../lib/prisma.js';
import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service.js';
import { generateICS, ICSEvent } from '../utils/ics.js';

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
  isBroadcast?: boolean;
}) => {
  return await NotificationService.notify(data);
};

// GET: Sync notifications as ICS
export const getNotificationsICS = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    // Find user by sync token
    const user = await prisma.user.findFirst({
      where: { syncToken: token as string },
      select: { userId: true, centerId: true, fullName: true }
    });

    if (!user) {
      return res.status(404).send('Invalid sync token');
    }

    // Fetch relevant notifications
    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { userId: null, centerId: null },
          { userId: user.userId },
          ...(user.centerId ? [{ centerId: user.centerId }] : [])
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    // Map to ICS format
    const icsEvents: ICSEvent[] = notifications.map(n => ({
      id: `notice-${n.notificationId}`,
      title: `AVISO: ${n.title}`,
      description: n.message,
      startDate: new Date(n.createdAt),
      // End date 1 hour after creation for visibility
      endDate: new Date(new Date(n.createdAt).getTime() + 60 * 60 * 1000)
    }));

    const icsContent = generateICS(icsEvents);

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="avisos.ics"');
    res.send(icsContent);
  } catch (error) {
    console.error("[Notification] Error in getNotificationsICS:", error);
    res.status(500).send('Internal Server Error');
  }
};
