import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { ROLES } from '@iter/shared';
import { generateICS, ICSEvent } from '../utils/ics.js';

/**
 * Shared logic to fetch events based on user and optional date range
 */
async function fetchEventsForUser(user: { userId: number, role: string, centreId?: number | null }, start?: string, end?: string) {
  // 1. Obtener el profesor asociado al usuario (si es rol profesor)
  let professorId: number | null = null;
  if (user.role === ROLES.PROFESSOR) {
    const professor = await prisma.teacher.findUnique({
      where: { id_user: user.userId }
    });
    if (professor) {
      professorId = professor.id_teacher;
    }
  }

  // Filtros de fecha
  const dateFilter = start && end ? {
    data: {
      gte: new Date(start as string),
      lte: new Date(end as string),
    }
  } : {};

  const assignmentDateFilter = start && end ? {
    OR: [
      { data_inici: { gte: new Date(start as string), lte: new Date(end as string) } },
      { data_fi: { gte: new Date(start as string), lte: new Date(end as string) } },
    ]
  } : {};

  // Consultas en paralelo
  const [dbEvents, assignments] = await Promise.all([
    // 1. Milestones
    prisma.calendarEvent.findMany({
      where: dateFilter,
      include: { phase: true }
    }),
    
    // 2. Assignments (basado en rol) + Sessions
    user.role === ROLES.ADMIN 
      ? prisma.assignment.findMany({ 
          where: assignmentDateFilter, 
          include: { workshop: true, center: true, sessions: { include: { staff: { include: { user: true } } } } } 
        })
      : user.role === ROLES.COORDINADOR
      ? prisma.assignment.findMany({ 
          where: { ...assignmentDateFilter, id_center: user.centreId! }, 
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
      : user.role === ROLES.PROFESSOR
      ? prisma.assignment.findMany({ 
          where: { 
            ...assignmentDateFilter, 
            OR: [
              { teachers: { some: { id_user: user.userId } } },
              { sessions: { some: { staff: { some: { id_user: user.userId } } } } }
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

  // Mapeo de Milestones
  dbEvents.forEach((e: any) => {
    const date = e.data ? new Date(e.data) : null;
    if (date && !isNaN(date.getTime())) {
      events.push({
        id: `milestone-${e.id_event}`,
        title: e.titol,
        date: date.toISOString(),
        type: e.type,
        description: e.descripcio || '',
        metadata: { fase: e.phase?.nom || 'General' }
      });
    }
  });

  // Mapeo de Assignments y sus Sessions
  assignments.forEach((a: any) => {
    if (a.data_inici && a.data_fi && user.role !== ROLES.PROFESSOR) {
      const startDate = new Date(a.data_inici);
      const endDate = new Date(a.data_fi);
      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        events.push({
          id: `assign-${a.id_assignment}`,
          title: user.role === ROLES.COORDINADOR ? `Workshop: ${a.workshop?.titol}` : `${a.workshop?.titol}`,
          date: startDate.toISOString(),
          endDate: endDate.toISOString(),
          type: 'assignment',
          metadata: { 
            id_assignment: a.id_assignment,
            centre: a.center?.nom,
            adreca: a.center?.adreca
          }
        });
      }
    }

    if (a.sessions) {
      a.sessions.forEach((s: any) => {
        const isSessionStaff = s.staff?.some((sp: any) => sp.id_user === user.userId);
        if (user.role === ROLES.PROFESSOR && !isSessionStaff) return;

        const sessionDate = s.data_session ? new Date(s.data_session) : null;
        if (sessionDate && !isNaN(sessionDate.getTime())) {
          events.push({
            id: `session-${s.id_session}`,
            title: `SESSIÓ: ${a.workshop?.titol || 'Workshop'}`,
            date: sessionDate.toISOString(),
            type: 'session',
            metadata: {
              id_assignment: a.id_assignment,
              hora: `${s.hora_inici || '09:00'} - ${s.hora_fi || '13:00'}`,
              centre: a.center?.nom || 'Centre Iter'
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
      { userId: user.userId, role: user.role, centreId: user.centreId }, 
      start as string, 
      end as string
    );
    res.json(events);
  } catch (error) {
    console.error("[Calendar] Error in getCalendarEvents:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getCalendarICS = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    
    // Find user by sync token
    const user = await prisma.user.findFirst({
      where: { sync_token: token },
      include: { role: true }
    });

    if (!user) {
      return res.status(404).send('Invalid sync token');
    }

    const events = await fetchEventsForUser({
      userId: user.id_user,
      role: user.role.nom_role,
      centreId: user.id_center
    });

    // Map to ICS format
    const icsEvents: ICSEvent[] = events.map(e => ({
      id: e.id,
      title: e.title,
      description: e.description || e.metadata?.fase,
      startDate: new Date(e.date),
      endDate: e.endDate ? new Date(e.endDate) : undefined,
      location: e.metadata?.centre || e.metadata?.adreca
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
