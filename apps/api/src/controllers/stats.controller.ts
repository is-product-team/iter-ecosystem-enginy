import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { RiskAnalysisService } from '../services/risk-analysis.service.js';

/**
 * GET /stats/peticions-by-status
 */
export const getStatsByStatus = async (req: Request, res: Response) => {
  try {
    const counts = await prisma.peticio.groupBy({
      by: ['estat'],
      _count: {
        _all: true
      }
    });

    const stats = counts.map(c => ({
      estat: c.estat.toLowerCase(),
      total: c._count._all,
      last_update: new Date()
    }));

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener estadísticas de estados' });
  }
};

/**
 * GET /stats/popular-workshops
 */
export const getPopularWorkshops = async (req: Request, res: Response) => {
  try {
    const tallers = await prisma.taller.findMany({
      include: {
        peticions: true
      },
      take: 10
    });

    const stats = tallers.map(t => ({
      _id: t.titol,
      total_solicitudes: t.peticions.length,
      alumnes_totals: t.peticions.reduce((acc, p) => acc + (p.alumnes_aprox || 0), 0)
    })).sort((a, b) => b.total_solicitudes - a.total_solicitudes);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener talleres populares' });
  }
};

/**
 * GET /stats/recent-activity
 */
export const getRecentActivity = async (req: Request, res: Response) => {
  try {
    const logs = await prisma.logAuditoria.findMany({
      orderBy: { data_hora: 'desc' },
      take: 10,
      include: { usuari: true }
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener actividad reciente' });
  }
};

/**
 * DELETE /stats/logs/cleanup
 */
export const cleanupLogs = async (req: Request, res: Response) => {
  try {
    const result = await prisma.logAuditoria.deleteMany({
      where: {
        data_hora: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }
    });
    res.json({ success: true, deletedCount: result.count });
  } catch (error) {
    res.status(500).json({ error: 'Error al limpiar logs' });
  }
};

// POST: Ejecutar análisis de riesgo de abandono
export const runRiskAnalysis = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.body;
    const service = new RiskAnalysisService();

    if (studentId) {
      const result = await service.analyzeStudentRisk(parseInt(studentId));
      return res.json({ processed: 1, results: [result] });
    } else {
      const studentsWithAttendance = await prisma.assistencia.findMany({
        select: { inscripcio: { select: { id_alumne: true } } },
        distinct: ['id_inscripcio']
      });

      const uniqueIds = [...new Set(studentsWithAttendance.map((a: any) => a.inscripcio.id_alumne))];

      const results = [];
      for (const id of uniqueIds) {
        results.push(await service.analyzeStudentRisk(Number(id)));
      }

      res.json({ processed: results.length, active_risks: results.filter(r => r.riskLevel === 'CRITICAL' || r.riskLevel === 'HIGH') });
    }

  } catch (error) {
    console.error("Error in risk analysis:", error);
    res.status(500).json({ error: 'Error al ejecutar análisis de riesgo' });
  }
};

// GET: Estadístiques de monitorització de la Fase 2
export const getPhase2MonitoringStats = async (req: Request, res: Response) => {
  try {
    const assignacions = await prisma.assignacio.findMany({
      where: {
        estat: { in: ['PUBLISHED', 'DATA_ENTRY', 'DATA_SUBMITTED', 'VALIDATED'] }
      },
      include: {
        centre: true,
        checklist: true,
        inscripcions: true,
        prof1: true,
        prof2: true
      }
    });

    const monitoring = assignacions.map((a: any) => {
      const hasProfessors = !!(a.prof1_id && a.prof2_id);
      const hasStudents = a.inscripcions.length > 0;
      const allDocsOk = a.inscripcions.every((i: any) => i.acord_pedagogic && i.autoritzacio_mobilitat && i.registre_ceb_confirmat);
      const isComplete = hasProfessors && hasStudents && allDocsOk;

      return {
        id_assignacio: a.id_assignacio,
        centre: a.centre.nom,
        taller_id: a.id_taller,
        estat: a.estat,
        completat: isComplete,
        detalls: {
          professors: hasProfessors,
          alumnes: hasStudents,
          documentacio: allDocsOk
        }
      };
    });

    res.json(monitoring);
  } catch (error) {
    console.error("Error monitoring Phase 2:", error);
    res.status(500).json({ error: 'Error al obtenir estadístiques de monitorització.' });
  }
};
