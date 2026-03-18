import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { ROLES } from '@iter/shared';

export const getCalendarEvents = async (req: Request, res: Response) => {
  try {
    const { user } = req as any;
    const { start, end } = req.query;

    // 1. Obtener el profesor asociado al usuario (si es rol profesor) de forma directa por ID
    let professorId: number | null = null;
    if (user.role === ROLES.PROFESOR) {
      const professor = await prisma.professor.findUnique({
        where: { id_usuari: user.userId }
      });
      if (professor) {
        professorId = professor.id_professor;
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
      prisma.calendariEvent.findMany({
        where: dateFilter,
        include: { fase: true }
      }),
      
      // 2. Assignments (basado en rol) + Sessions
      user.role === ROLES.ADMIN 
        ? prisma.assignacio.findMany({ 
            where: assignmentDateFilter, 
            include: { taller: true, centre: true, sessions: { include: { staff: { include: { usuari: true } } } } } 
          })
        : user.role === ROLES.COORDINADOR
        ? prisma.assignacio.findMany({ 
            where: { ...assignmentDateFilter, id_centre: user.centreId }, 
            include: { 
              taller: true, 
              sessions: {
                include: {
                  staff: {
                    include: {
                      usuari: true
                    }
                  }
                }
              }
            } 
          })
        : user.role === ROLES.PROFESOR
        ? prisma.assignacio.findMany({ 
            where: { 
              ...assignmentDateFilter, 
              OR: [
                // Check if the user is the primary referent
                { professors: { some: { id_usuari: user.userId } } },
                // Check if the user is assigned as staff to any session within this assignment
                { sessions: { some: { staff: { some: { id_usuari: user.userId } } } } },
                // Check if the user is assigned as prof1 or prof2 (legacy support)
                ...(professorId ? [
                  { prof1_id: professorId },
                  { prof2_id: professorId }
                ] : [])
              ]
            }, 
            include: { 
              taller: true, 
              centre: true, 
              sessions: {
                include: {
                  staff: {
                    include: {
                      usuari: true
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
          metadata: { fase: e.fase?.nom || 'General' }
        });
      }
    });

    // Mapeo de Assignments y sus Sessions
    assignments.forEach((a: any) => {
      // La barra de rango del taller (Azul claro) - Ocultar para profesores para reducir ruido
      if (a.data_inici && a.data_fi && user.role !== ROLES.PROFESOR) {
        const startDate = new Date(a.data_inici);
        const endDate = new Date(a.data_fi);
        
        if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
          events.push({
            id: `assign-${a.id_assignacio}`,
            title: user.role === ROLES.COORDINADOR ? `Taller: ${a.taller?.titol}` : `${a.taller?.titol}`,
            date: startDate.toISOString(),
            endDate: endDate.toISOString(),
            type: 'assignment',
            metadata: { 
              id_assignacio: a.id_assignacio,
              centre: a.centre?.nom,
              adreca: a.centre?.adreca
            }
          });
        }
      }

      // Las sesiones individuales (Amarillo)
      if (a.sessions) {
        a.sessions.forEach((s: any) => {
          // Si es profesor, solo mostramos las sesiones donde está asignado (o si es el referent general)
          const isReferentGeneral = a.prof1_id === professorId || a.prof2_id === professorId;
          const isSessionStaff = s.staff?.some((sp: any) => sp.id_usuari === user.userId);
          
          if (user.role === ROLES.PROFESOR && !isReferentGeneral && !isSessionStaff) {
            return;
          }

          const sessionDate = s.data_sessio ? new Date(s.data_sessio) : null;
          if (sessionDate && !isNaN(sessionDate.getTime())) {
            events.push({
              id: `session-${s.id_sessio}`,
              title: `SESSIÓ: ${a.taller?.titol || 'Taller'}`,
              date: sessionDate.toISOString(),
              type: 'session',
              metadata: {
                id_assignacio: a.id_assignacio,
                hora: `${s.hora_inici || '09:00'} - ${s.hora_fi || '13:00'}`,
                centre: a.centre?.nom || 'Centre del Professor'
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
