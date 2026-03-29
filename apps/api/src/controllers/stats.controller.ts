import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { RiskAnalysisService } from '../services/risk-analysis.service.js';

/**
 * GET /stats/requests-by-status
 */
export const getStatsByStatus = async (req: Request, res: Response) => {
  try {
    const counts = await prisma.request.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    const stats = counts.map((c: any) => ({
      status: c.status.toLowerCase(),
      total: c._count.status,
      lastUpdate: new Date()
    }));

    res.json(stats);
  } catch (_error) {
    res.status(500).json({ error: 'Error al obtener estadísticas de estados' });
  }
};

/**
 * GET /stats/popular-workshops
 */
export const getPopularWorkshops = async (req: Request, res: Response) => {
  try {
    const workshops = await prisma.workshop.findMany({
      include: {
        requests: true
      },
      take: 10
    });

    const stats = workshops.map((t: any) => ({
      title: t.title,
      totalRequests: t.requests.length,
      totalStudents: t.requests.reduce((acc: number, p: any) => acc + (p.studentsAprox || 0), 0)
    })).sort((a: any, b: any) => b.totalRequests - a.totalRequests);

    res.json(stats);
  } catch (_error) {
    res.status(500).json({ error: 'Error al obtener talleres populares' });
  }
};

/**
 * GET /stats/recent-activity
 */
export const getRecentActivity = async (req: Request, res: Response) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { user: true }
    });
    res.json(logs);
  } catch (_error) {
    res.status(500).json({ error: 'Error al obtener actividad reciente' });
  }
};

/**
 * DELETE /stats/logs/cleanup
 */
export const cleanupLogs = async (req: Request, res: Response) => {
  try {
    const result = await prisma.auditLog.deleteMany({
      where: {
        createdAt: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }
    });
    res.json({ success: true, deletedCount: result.count });
  } catch (_error) {
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
      const studentsWithAttendance = await prisma.attendance.findMany({
        select: { enrollment: { select: { studentId: true } } },
        distinct: ['enrollmentId']
      });

      const uniqueIds = [...new Set(studentsWithAttendance.map((a: any) => a.enrollment.studentId))];

      const results = [];
      for (const id of uniqueIds) {
        results.push(await service.analyzeStudentRisk(Number(id)));
      }

      res.json({ processed: results.length, active_risks: results.filter(r => r.riskLevel === 'CRITICAL' || r.riskLevel === 'HIGH') });
    }

  } catch (_error) {
    console.error("Error in risk analysis:", _error);
    res.status(500).json({ error: 'Error al ejecutar análisis de riesgo' });
  }
};

// GET: Phase 2 monitoring statistics
export const getPhase2MonitoringStats = async (req: Request, res: Response) => {
  try {
    const assignments = await prisma.assignment.findMany({
      where: {
        status: { in: ['PUBLISHED', 'DATA_ENTRY', 'DATA_SUBMITTED', 'VALIDATED'] }
      },
      include: {
        center: true,
        checklist: true,
        enrollments: true,
        teachers: true
      }
    });

    const monitoring = assignments.map((a: any) => {
      const hasTeachers = a.teachers.length >= 2;
      const hasStudents = a.enrollments.length > 0;
      const allDocsOk = a.enrollments.every((i: any) => {
        const docs = (i.docsStatus as any) || {};
        return docs.pedagogicalAgreement && docs.mobilityAuthorization && docs.cebRegistrationConfirmed;
      });
      const isComplete = hasTeachers && hasStudents && allDocsOk;

      return {
        assignmentId: a.assignmentId,
        center: a.center.name,
        workshopId: a.workshopId,
        status: a.status,
        isComplete: isComplete,
        details: {
          teachers: hasTeachers,
          students: hasStudents,
          documentation: allDocsOk
        }
      };
    });

    res.json(monitoring);
  } catch (_error) {
    console.error("Error monitoring Phase 2:", _error);
    res.status(500).json({ error: 'Error getting monitoring statistics.' });
  }
};
