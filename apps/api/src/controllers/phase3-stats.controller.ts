import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { ROLES } from '@iter/shared';
import { SessionService } from '../services/session.service.js';

/**
 * GET: Aggregated statistics for a center's Phase 3 status.
 */
export const getCenterPhase3Stats = async (req: Request, res: Response) => {
    const { centerId: targetCenterId } = req.params;
    const { centerId, role } = req.user!;

    // Security Scoping
    const tCenterId = targetCenterId as string;
    if (role !== ROLES.ADMIN && Number(tCenterId) !== Number(centerId)) {
        return res.status(403).json({ error: 'Access denied' });
    }

    try {
        const cId = parseInt(tCenterId);

        // 1. Get all relevant assignments for the center (Active and recently Completed)
        const assignments = await prisma.assignment.findMany({
            where: { 
                centerId: cId,
                status: { in: ['IN_PROGRESS', 'COMPLETED'] }
            },
            include: {
                workshop: true,
                _count: {
                    select: { sessions: true }
                }
            }
        });

        // 2. Calculate health for each assignment
        const assignmentStats = await Promise.all(assignments.map(async (a) => {
            const health = await SessionService.getAttendanceHealth(a.assignmentId);
            
            // Check for staff gaps (sessions with no teachers assigned)
            const sessionsWithStaff = await prisma.session.findMany({
                where: { assignmentId: a.assignmentId },
                include: { _count: { select: { staff: true } } }
            });
            const hasStaffGap = sessionsWithStaff.some(s => s._count.staff === 0);

            return {
                assignmentId: a.assignmentId,
                title: a.workshop.title,
                progress: health.totalSessions > 0 ? Math.round(((health.totalSessions - health.pendingCount) / health.totalSessions) * 100) : 0,
                health: health.percentage,
                totalSessions: health.totalSessions,
                pendingAttendance: health.pendingCount,
                modality: a.workshop.modality,
                centerName: a.centerId.toString(), // We could fetch the name from elsewhere, but for now we'll use ID or omit
                hasStaffGap
            };
        }));

        // 3. Get sessions for today
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const sessionsToday = await prisma.session.findMany({
            where: {
                assignment: { centerId: cId },
                sessionDate: {
                    gte: todayStart,
                    lte: todayEnd
                }
            },
            include: {
                assignment: { include: { workshop: true } }
            }
        });

        // 4. Get recent incidents
        const recentIncidents = await prisma.issue.findMany({
            where: { centerId: cId },
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                assignment: { include: { workshop: true } },
                session: true
            }
        });

        res.json({
            summary: {
                activeAssignments: assignments.filter(a => a.status === 'IN_PROGRESS').length,
                sessionsToday: sessionsToday.length,
                totalPendingAttendance: assignmentStats.reduce((acc, curr) => acc + curr.pendingAttendance, 0),
                totalIncidents: await prisma.issue.count({ where: { centerId: cId } })
            },
            assignments: assignments.map((a, index) => ({
                ...assignmentStats[index],
                status: a.status
            })),
            today: sessionsToday.map(s => ({
                sessionId: s.sessionId,
                title: s.assignment.workshop.title,
                time: `${s.startTime || '09:00'} - ${s.endTime || '11:00'}`
            })),
            incidents: recentIncidents
        });

    } catch (error) {
        console.error("Error fetching Phase 3 stats:", error);
        res.status(500).json({ error: 'Error calculating Phase 3 statistics' });
    }
};

/**
 * POST: Create an incident linked to an assignment or session.
 */
export const createLinkedIncident = async (req: Request, res: Response) => {
    const { centerId, description, assignmentId, sessionId } = req.body;
    const { userId } = req.user!;

    try {
        const newIssue = await prisma.issue.create({
            data: {
                centerId: parseInt(centerId),
                description,
                assignmentId: assignmentId ? parseInt(assignmentId) : undefined,
                sessionId: sessionId ? parseInt(sessionId) : undefined
            }
        });

        // Log the incident creation
        await prisma.auditLog.create({
            data: {
                userId,
                action: `Created incident ${newIssue.issueId}`,
                details: { issueId: newIssue.issueId, assignmentId, sessionId }
            }
        });

        res.status(201).json(newIssue);
    } catch (error) {
        console.error("Error creating linked incident:", error);
        res.status(500).json({ error: 'Error creating incident' });
    }
};
