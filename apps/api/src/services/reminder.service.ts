import prisma from '../lib/prisma.js';
import { createNotificationInterna } from '../controllers/notificacio.controller.js';
import { addHours, isBefore, isAfter } from 'date-fns';

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
    
    console.log('⏰ ReminderService: Starting background checks (1h interval)');
    
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
    const now = new Date();
    const next24h = addHours(now, 24);
    
    try {
      // 1. Check for upcoming Sessions
      const upcomingSessions = await prisma.session.findMany({
        where: {
          data_session: {
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
        // Notify all staff assigned to this session
        const staffUsers = session.staff.map(s => s.user);
        const teachers = session.assignment.teachers.map(t => t.user);
        
        // Unique users to notify
        const usersToNotify = Array.from(new Set([...staffUsers, ...teachers]));

        for (const user of usersToNotify) {
          const reminderId = `rem-session-${session.id_session}-${user.id_user}`;
          
          // Check if notification already exists to avoid spamming
          const existing = await prisma.notification.findFirst({
            where: {
              id_user: user.id_user,
              titol: { startsWith: 'Recordatori: ' },
              missatge: { contains: session.assignment.workshop.titol }
            }
          });

          if (!existing) {
            await createNotificationInterna({
              id_user: user.id_user,
              titol: `Recordatori: Sessió de Taller`,
              missatge: `Tens una sessió del taller "${session.assignment.workshop.titol}" programada per avui a les ${session.hora_inici || 'la seva hora habitual'}.`,
              tipus: 'SISTEMA',
              importancia: 'INFO'
            });
          }
        }
      }

      // 2. Check for upcoming Milestones (CalendarEvents)
      const upcomingMilestones = await prisma.calendarEvent.findMany({
        where: {
          data: {
            gt: now,
            lte: next24h
          }
        }
      });

      for (const milestone of upcomingMilestones) {
        // Global milestones notify all relevant users? 
        // For now, let's just create a global notification (id_user and id_center null)
        const existing = await prisma.notification.findFirst({
          where: {
            id_user: null,
            id_center: null,
            titol: milestone.titol
          }
        });

        if (!existing) {
          await createNotificationInterna({
            titol: `Fita Pròxima: ${milestone.titol}`,
            missatge: `Recorda: La fita "${milestone.titol}" està programada per a les properes 24 hores.`,
            tipus: 'FASE',
            importancia: 'WARNING'
          });
        }
      }

    } catch (error) {
      console.error('❌ ReminderService Error:', error);
    }
  }
}
