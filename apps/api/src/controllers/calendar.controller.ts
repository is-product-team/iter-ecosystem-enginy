import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { ROLES } from '@iter/shared';
import { generateICS, ICSEvent } from '../utils/ics.js';

/**
 * Shared logic to fetch events based on user and optional date range
 */
async function fetchEventsForUser(user: { userId: number, role: string, centerId?: number | null }, start?: string, end?: string) {
  // 1. Get the teacher associated with the user (if teacher role)
  let _teacherId: number | null = null;
  if (user.role === ROLES.TEACHER) {
    const teacher = await prisma.teacher.findUnique({
      where: { userId: user.userId }
    });
    if (teacher) {
      _teacherId = teacher.teacherId;
    }
  }

  // Date filters
  const dateFilter = start && end ? {
    date: {
      gte: new Date(start as string),
      lte: new Date(end as string),
    }
  } : {};

  const assignmentDateFilter = start && end ? {
    OR: [
      { startDate: { gte: new Date(start as string), lte: new Date(end as string) } },
      { endDate: { gte: new Date(start as string), lte: new Date(end as string) } },
    ]
  } : {};

  // Parallel queries
  const [dbEvents, assignments] = await Promise.all([
    // 1. Milestones
    prisma.calendarEvent.findMany({
      where: dateFilter,
      include: { phase: true }
    }),

    // 2. Assignments (based on role) + Sessions
    user.role === ROLES.ADMIN
      ? prisma.assignment.findMany({
        where: assignmentDateFilter,
        include: { workshop: true, center: true, sessions: { include: { staff: { include: { user: true } } } } }
      })
      : user.role === ROLES.COORDINATOR
        ? prisma.assignment.findMany({
          where: { ...assignmentDateFilter, centerId: user.centerId! },
          include: {
            workshop: true,
            sessions: {
              include: {
                staff: {
                  include: {
                    user: true
                  }
                }
              }
            }
          }
        })
        : user.role === ROLES.TEACHER
          ? prisma.assignment.findMany({
            where: {
              ...assignmentDateFilter,
              OR: [
                { teachers: { some: { userId: user.userId } } },
                { sessions: { some: { staff: { some: { userId: user.userId } } } } }
              ]
            },
            include: {
              workshop: true,
              center: true,
              sessions: {
                include: {
                  staff: {
                    include: {
                      user: true
                    }
                  }
                }
              }
            }
          })
          : Promise.resolve([]),
  ]);

  const events: any[] = [];

  // Mapping Milestones
  dbEvents.forEach((e: any) => {
    const date = e.date ? new Date(e.date) : null;
    if (date && !isNaN(date.getTime())) {
      events.push({
        id: `milestone-${e.eventId}`,
        title: e.title,
        date: date.toISOString(),
        type: e.type,
        description: e.description || '',
        metadata: { phase: e.phase?.name || 'General' }
      });
    }
  });

  // Mapping Assignments and Sessions
  assignments.forEach((a: any) => {
    if (a.startDate && a.endDate && user.role !== ROLES.TEACHER) {
      const startDate = new Date(a.startDate);
      const endDate = new Date(a.endDate);
      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        events.push({
          id: `assign-${a.assignmentId}`,
          title: user.role === ROLES.COORDINATOR ? `Workshop: ${a.workshop?.title}` : `${a.workshop?.title}`,
          date: startDate.toISOString(),
          endDate: endDate.toISOString(),
          type: 'assignment',
          metadata: {
            assignmentId: a.assignmentId,
            center: a.center?.name,
            address: a.center?.address
          }
        });
      }
    }

    if (a.sessions) {
      a.sessions.forEach((s: any) => {
        const isSessionStaff = s.staff?.some((sp: any) => sp.userId === user.userId);
        if (user.role === ROLES.TEACHER && !isSessionStaff) return;

        const sessionDate = s.sessionDate ? new Date(s.sessionDate) : null;
        if (sessionDate && !isNaN(sessionDate.getTime())) {
          events.push({
            id: `session-${s.sessionId}`,
            title: `SESSION: ${a.workshop?.title || 'Workshop'}`,
            date: sessionDate.toISOString(),
            type: 'session',
            metadata: {
              assignmentId: a.assignmentId,
              time: `${s.startTime || '09:00'} - ${s.endTime || '13:00'}`,
              center: a.center?.name || 'Iter Center'
            }
          });
        }
      });
    }
  });

  return events;
}

export const getCalendarEvents = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { start, end } = req.query;
    const events = await fetchEventsForUser(
      { userId: user.userId, role: user.role, centerId: user.centerId },
      start as string,
      end as string
    );
    res.json(events);
  } catch (error) {
    console.error("[Calendar] Critical error in getCalendarEvents:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getCalendarICS = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    // Find user by sync token
    const user = await prisma.user.findFirst({
      where: { syncToken: token as string },
      include: { role: true }
    }) as any;

    if (!user) {
      return res.status(404).send('Invalid sync token');
    }

    const events = await fetchEventsForUser({
      userId: user.userId,
      role: user.role.roleName,
      centerId: user.centerId
    });

    // Map to ICS format
    const icsEvents: ICSEvent[] = events.map(e => ({
      id: e.id,
      title: e.title,
      description: e.description || e.metadata?.phase,
      startDate: new Date(e.date),
      endDate: e.endDate ? new Date(e.endDate) : undefined,
      location: e.metadata?.center || e.metadata?.address
    }));

    const icsContent = generateICS(icsEvents);

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="calendar.ics"');
    res.send(icsContent);
  } catch (error) {
    console.error("[Calendar] Error in getCalendarICS:", error);
    res.status(500).send('Internal Server Error');
  }
};
