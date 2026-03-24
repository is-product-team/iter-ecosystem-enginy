import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { ROLES } from '@iter/shared';

export const getCalendarEvents = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { start, end } = req.query;

    // 1. Obtener el profesor asociado al usuario (si es rol profesor) de forma directa por ID
    let professorId: number | null = null;
    if (user.role === ROLES.PROFESSOR) {
      const professor = await prisma.teacher.findUnique({
        where: { id_user: user.userId }
      });
      if (professor) {
        professorId = professor.id_teacher;
      }
    }

    // Filtros de fecha opcionales pero recomendados para escalabilidad
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

    // Ejecutamos consultas en paralelo para mejorar rendimiento
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
            where: { ...assignmentDateFilter, id_center: user.centreId }, 
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
                // Check if the user is the primary referent
                { teachers: { some: { id_user: user.userId } } },
                // Check if the user is assigned as staff to any session within this assignment
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
          type: e.tipus,
          description: e.descripcio || '',
          metadata: { phase: e.phase?.nom || 'General' }
        });
      }
    });

    // Mapeo de Assignments y sus Sessions
    assignments.forEach((a: any) => {
      // La barra de rango del workshop (Azul claro) - Ocultar para profesores para reducir ruido
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
              center: a.center?.nom,
              adreca: a.center?.adreca
            }
          });
        }
      }

      // Las sesiones individuales (Amarillo)
      if (a.sessions) {
        a.sessions.forEach((s: any) => {
          // Si es profesor, solo mostramos las sesiones donde está asignado (o si es el referent general)
          const isReferentGeneral = a.teachers?.some((t: any) => t.id_user === user.userId);
          const isSessionStaff = s.staff?.some((sp: any) => sp.id_user === user.userId);
          
          if (user.role === ROLES.PROFESSOR && !isReferentGeneral && !isSessionStaff) {
            return;
          }

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
                center: a.center?.nom || 'Center del Teacher'
              }
            });
          }
        });
      }
    });

    res.json(events);
  } catch (error) {
    console.error("[Calendar] Critical error in getCalendarEvents:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
