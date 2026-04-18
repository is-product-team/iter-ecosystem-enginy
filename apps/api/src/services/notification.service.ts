import prisma from '../lib/prisma.js';
import { sendNotificationEmail } from '../services/mail.service.js';
import { t, formatNotificationMessage } from '../utils/i18n.js';
import { Role } from '@prisma/client';

export interface NotificationData {
  title: string;
  message: string;
  type: string;
  centerId?: number;
  userId?: number;
  importance?: 'INFO' | 'WARNING' | 'URGENT';
  isBroadcast?: boolean;
  targetRoles?: string[];
}

export class NotificationService {
  /**
   * Main entry point to create and deliver notifications.
   * [PRODUCTION READY] - Returns the notification object immediately after DB persistence.
   */
  static async notify(data: NotificationData) {
    try {
      // 1. DEDUPLICATION GUARD (10 second window to prevent spam/double-clicks)
      const tenSecondsAgo = new Date(Date.now() - 10000);
      const existing = await prisma.notification.findFirst({
        where: {
          centerId: data.centerId,
          userId: data.userId,
          title: data.title,
          message: data.message,
          createdAt: { gte: tenSecondsAgo }
        }
      });

      if (existing) {
        console.log(`[NotificationService] 🛡️ Deduplicated: Skipping redundant notification`);
        return existing;
      }

      // 2. PERSIST TO DATABASE
      const notification = await prisma.notification.create({
        data: {
          userId: data.userId,
          centerId: data.centerId,
          title: data.title,
          message: data.message,
          type: data.type,
          importance: data.importance || 'INFO',
        }
      });

      // 3. ASYNC DELIVERY (Fire and Forget)
      // We don't 'await' this so that the API responds immediately.
      setImmediate(async () => {
        try {
          await NotificationService.deliver(data);
        } catch (err) {
          console.error('[NotificationService] ⚠️ Background delivery failed:', err);
        }
      });

      return notification;
    } catch (error) {
      console.error('[NotificationService] ❌ Critical Error during creation:', error);
      throw error;
    }
  }

  /**
   * Internal Background Delivery Logic
   * Handles recipient identification, translation, and email sending.
   */
  private static async deliver(data: NotificationData) {
    const startTime = Date.now();
    console.log(`[NotificationService] 🚀 Starting background delivery for: ${data.title}`);

    // Parse parameters for translation
    let params = {};
    try {
      if (data.message.startsWith('{')) {
        const parsed = JSON.parse(data.message);
        params = parsed.params || {};
      }
    } catch (e) { /* message is just plain text */ }

    const translatedTitle = t(data.title, params, 'ca');
    const translatedMessage = formatNotificationMessage(data.message, 'ca');

    let recipients: { email: string; fullName: string }[] = [];

    // A. Specific User
    if (data.userId) {
      const user = await prisma.user.findUnique({ where: { userId: data.userId } });
      if (user?.email && user.emailNotificationsEnabled) {
        recipients.push({ email: user.email, fullName: user.fullName });
      }
    } 
    // B. Specific Center
    else if (data.centerId) {
      const coords = (await prisma.user.findMany({
        where: { centerId: data.centerId, role: { roleName: 'COORDINATOR' }, emailNotificationsEnabled: true },
        select: { email: true, fullName: true }
      })) || [];
      recipients.push(...coords);
    }
    // C. Global Broadcast
    else if (data.isBroadcast) {
      const roles = data.targetRoles || ['COORDINATOR', 'ADMIN'];
      const targets = (await prisma.user.findMany({
        where: { role: { roleName: { in: roles } }, emailNotificationsEnabled: true },
        select: { email: true, fullName: true }
      })) || [];
      recipients.push(...targets);
    }

    // --- INFALLIBLE DEDUPLICATION ---
    // Ensure we only send ONE email per address in this batch, regardless of multiple accounts
    const uniqueRecipients = Array.from(new Map(recipients.map(r => [r.email.toLowerCase(), r])).values());

    if (uniqueRecipients.length === 0) {
      console.log(`[NotificationService] ℹ️ No eligible recipients found for delivery.`);
      return;
    }

    console.log(`[NotificationService] 📬 Sending to ${uniqueRecipients.length} unique recipients...`);

    // Process delivery (sequential loop but async background)
    let successCount = 0;
    for (const recipient of uniqueRecipients) {
      try {
        await sendNotificationEmail(recipient.email, recipient.fullName, {
          title: translatedTitle,
          message: translatedMessage
        });
        successCount++;
      } catch (err) {
        console.error(`[NotificationService] ❌ Failed to send to ${recipient.email}:`, err);
      }
    }

    const duration = Date.now() - startTime;
    console.log(`[NotificationService] ✅ Delivery Complete: ${successCount}/${uniqueRecipients.length} sent in ${duration}ms`);
  }
}
