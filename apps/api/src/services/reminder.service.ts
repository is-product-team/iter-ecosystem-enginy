import prisma from '../lib/prisma.js';
import { NotificationService } from './notification.service.js';
import { addHours } from 'date-fns';

/**
 * ReminderService handles background checks for upcoming events
 * and triggers notifications for users.
 */
export class ReminderService {
  private static interval: NodeJS.Timeout | null = null;

  /**
   * Starts the reminder check interval (every hour)
   */
  static start() {
    if (this.interval) return;

    // Run immediately on start
    this.checkReminders();

    // Then every hour
    this.interval = setInterval(() => {
      this.checkReminders();
    }, 60 * 60 * 1000);
  }

  static stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  /**
   * Scans for events happening in the next 24 hours
   */
  private static async checkReminders() {
    try {
      // Basic lock: Don't run if another check happened recently (e.g. within 30 min)
      // This helps if multiple API instances are running
      const recentCheck = await prisma.notification.findFirst({
        where: {
          type: 'SYSTEM',
          title: 'calendar_sync_title',
          createdAt: {
            gt: new Date(Date.now() - 30 * 60 * 1000)
          }
        }
      });
      if (recentCheck) {
        return;
      }

      // Record this check heartbeat
      await prisma.notification.create({
        data: {
          title: 'calendar_sync_title',
          message: 'calendar_sync_msg',
          type: 'SYSTEM',
          importance: 'INFO',
          isRead: true
        }
      });

      const now = new Date();
      const next24h = addHours(now, 24);

      // 1. Check for upcoming Sessions
      const upcomingSessions = await prisma.session.findMany({
        where: {
          sessionDate: {
            gt: now,
            lte: next24h
          }
        },
        include: {
          assignment: {
            include: {
              workshop: true,
              center: true,
              teachers: {
                include: {
                  user: true
                }
              }
            }
          },
          staff: {
            include: {
              user: true
            }
          }
        }
      });

      for (const session of upcomingSessions) {
        try {
          const staffUsers = session.staff.map(s => s.user);
          const teachers = session.assignment.teachers.map(t => t.user);
          const usersToNotify = Array.from(new Set([...staffUsers, ...teachers]));

          for (const user of usersToNotify) {
            const existing = await prisma.notification.findFirst({
              where: {
                userId: user.userId,
                title: `Reminder: Workshop Session`,
                message: { contains: session.assignment.workshop.title },
                createdAt: {
                  gt: new Date(Date.now() - 12 * 60 * 60 * 1000) // Don't repeat if sent in last 12h
                }
              }
            });

            if (!existing) {
              await NotificationService.notify({
                userId: user.userId,
                title: 'session_reminder_title',
                message: JSON.stringify({
                  key: 'session_reminder_msg',
                  params: {
                    title: session.assignment.workshop.title,
                    time: session.startTime || 'su hora habitual'
                  }
                }),
                type: 'SYSTEM',
                importance: 'INFO'
              });
            }
          }
        } catch (sessionError) {
          console.error(`❌ Error processing reminders for session ${session.sessionId}:`, sessionError);
        }
      }

      // 2. Check for upcoming Milestones (CalendarEvents)
      const upcomingMilestones = await prisma.calendarEvent.findMany({
        where: {
          date: {
            gt: now,
            lte: next24h
          }
        }
      });

      for (const milestone of upcomingMilestones) {
        try {
          const existing = await prisma.notification.findFirst({
            where: {
              userId: null,
              centerId: null,
              title: `Upcoming Milestone: ${milestone.title}`,
              createdAt: {
                gt: new Date(Date.now() - 24 * 60 * 60 * 1000)
              }
            }
          });

          if (!existing) {
            await NotificationService.notify({
              title: 'milestone_reminder_title',
              message: JSON.stringify({
                key: 'milestone_reminder_msg',
                params: { title: milestone.title }
              }),
              type: 'PHASE',
              importance: 'WARNING'
            });
          }
        } catch (milestoneError) {
          console.error(`❌ Error processing reminders for milestone ${milestone.eventId}:`, milestoneError);
        }
      }

      // Cleanup old heartbeats (Optional, every Sunday or similar)
      // For now, we just let them exist as logs
    } catch (error) {
      console.error('❌ ReminderService Critical Error:', error);
    }
  }
}
