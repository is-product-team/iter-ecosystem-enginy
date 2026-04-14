import prisma from '../lib/prisma.js';
import { addWeeks, addDays, getDay, startOfDay } from 'date-fns';

export class SessionService {
    /**
     * Generates a list of dates based on a starting date and a list of week days.
     * @param startDate The date to start from.
     * @param schedule Array of days (e.g. ['Monday', 'Wednesday'])
     * @param totalSessions Total number of sessions to generate.
     */
    static generateDatesFromSchedule(startDate: Date, schedule: string[], totalSessions: number = 10): Date[] {
        if (!schedule || schedule.length === 0) {
            return this.generateSessionDates(startDate, totalSessions);
        }

        const dayMap: Record<string, number> = {
            'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3, 'thursday': 4, 'friday': 5, 'saturday': 6,
            'diumenge': 0, 'dilluns': 1, 'dimarts': 2, 'dimecres': 3, 'dijous': 4, 'divendres': 5, 'dissabte': 6,
            'domingo': 0, 'lunes': 1, 'martes': 2, 'miércoles': 3, 'jueves': 4, 'viernes': 5, 'sabado': 6, 'sábado': 6
        };

        const targetDays = schedule
            .map(d => dayMap[d.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "")])
            .filter(d => d !== undefined)
            .sort((a, b) => a - b);

        if (targetDays.length === 0) return this.generateSessionDates(startDate, totalSessions);

        const dates: Date[] = [];
        let current = startOfDay(startDate);
        
        // Find the first occurrence of one of the target days starting from startDate
        while (dates.length < totalSessions) {
            const currentDay = getDay(current);
            if (targetDays.includes(currentDay)) {
                dates.push(new Date(current));
            }
            current = addDays(current, 1);
            
            // Safety break to prevent infinite loops if something goes wrong
            if (dates.length === 0 && current > addDays(startDate, 14)) break;
        }

        return dates;
    }

    /**
     * Generates 10 weekly session dates starting from the given start date.
     * Assumes sessions are weekly on the same day of the week as the start date.
     */
    static generateSessionDates(startDate: Date, totalSessions: number = 10): Date[] {
        const dates: Date[] = [];
        const base = startOfDay(startDate);
        for (let i = 0; i < totalSessions; i++) {
            dates.push(addWeeks(base, i));
        }
        return dates;
    }

    /**
     * Ensures attendance records exist for a given assignment and session number.
     * If not, creates them for all currently enrolled students with a 'PRESENT' status.
     */
    static async ensureAttendanceRecords(assignmentId: number, sessionNum: number, date: Date) {
        // 1. Get all enrollments for this assignment
        const enrollments = await prisma.enrollment.findMany({
            where: { assignmentId },
            select: { enrollmentId: true }
        });

        if (enrollments.length === 0) return;

        // 2. Check which students already have attendance for this session
        const existingAttendance = await prisma.attendance.findMany({
            where: {
                enrollment: { assignmentId },
                sessionNumber: sessionNum
            },
            select: { enrollmentId: true }
        });

        const existingIds = new Set(existingAttendance.map((a) => a.enrollmentId));

        // 3. Identify and create missing records
        const toCreate = enrollments
            .filter((e) => !existingIds.has(e.enrollmentId))
            .map((e) => ({
                enrollmentId: e.enrollmentId,
                sessionNumber: sessionNum,
                sessionDate: date,
                status: 'PRESENT' as any // Prisma enum needs cast or correct string
            }));

        if (toCreate.length > 0) {
            await prisma.attendance.createMany({
                data: toCreate,
                skipDuplicates: true
            });
        }
    }

    /**
     * Retrieves the status of a session: 'Pending', 'Recorded', or 'Future'.
     */
    static async getSessionStatus(assignmentId: number, sessionNum: number): Promise<string> {
        const count = await prisma.attendance.count({
            where: {
                enrollment: { assignmentId },
                sessionNumber: sessionNum
            }
        });
        return count > 0 ? 'Recorded' : 'Pending';
    }

    /**
     * Synchronizes sessions for an assignment based on its workshop schedule.
     * Uses a smart diffing algorithm to preserve existing sessions (and their staff/issues) if dates match.
     */
    static async syncSessionsForAssignment(assignmentId: number) {
        const assignment = await prisma.assignment.findUnique({
            where: { assignmentId },
            include: { workshop: true }
        });

        if (!assignment || !assignment.startDate) return;

        const scheduleData = assignment.workshop?.executionDays;
        
        // 1. Generate desired session dates and times
        let desiredSessions: Array<{ date: Date; startTime?: string; endTime?: string }> = [];
        
        const isLegacyFormat = Array.isArray(scheduleData) && scheduleData.length > 0 && typeof scheduleData[0] === 'string';
        const isObjectFormat = Array.isArray(scheduleData) && scheduleData.length > 0 && typeof scheduleData[0] === 'object';

        if (isLegacyFormat) {
            // Legacy format: string[]
            const dates = this.generateDatesFromSchedule(assignment.startDate, scheduleData as string[]);
            desiredSessions = dates.map(d => ({ date: d }));
        } else if (isObjectFormat) {
            // Object format: { dayOfWeek: number, startTime: string, endTime: string }[]
            const phase = await prisma.phase.findFirst({
                where: { name: 'EXECUTION' },
                select: { startDate: true, endDate: true }
            });

            const startDate = assignment.startDate;
            const endDate = assignment.endDate || phase?.endDate || addWeeks(startDate, 10);

            let current = startOfDay(startDate);
            while (current <= endDate) {
                const dayOfWeek = getDay(current);
                const slots = (scheduleData as any[]).filter(s => s.dayOfWeek === dayOfWeek);
                
                for (const slot of slots) {
                    desiredSessions.push({
                        date: new Date(current),
                        startTime: slot.startTime,
                        endTime: slot.endTime
                    });
                }
                current = addDays(current, 1);
                if (desiredSessions.length > 50) break; // Safety limit
            }
        } else {
            // Default: 10 weekly sessions if no schedule is provided
            const dates = this.generateSessionDates(assignment.startDate, 10);
            desiredSessions = dates.map(d => ({ date: d }));
        }

        if (desiredSessions.length === 0) return;

        // 2. Fetch existing sessions
        const existingSessions = await prisma.session.findMany({
            where: { assignmentId },
            include: { staff: true }
        });

        // 3. Diffing
        const toDelete: number[] = [];
        const toKeep = new Set<number>();
        const toCreate: typeof desiredSessions = [];

        for (const desired of desiredSessions) {
            const match = existingSessions.find(s => 
                s.sessionDate.getTime() === desired.date.getTime() &&
                s.startTime === (desired.startTime || null) &&
                s.endTime === (desired.endTime || null)
            );

            if (match) {
                toKeep.add(match.sessionId);
            } else {
                toCreate.push(desired);
            }
        }

        // Identify sessions to delete (those not in toKeep and that don't have attendance)
        for (const existing of existingSessions) {
            if (!toKeep.has(existing.sessionId)) {
                // Check if it has attendance BEFORE deleting
                const attendanceCount = await prisma.attendance.count({
                    where: { enrollment: { assignmentId }, sessionDate: existing.sessionDate }
                });
                if (attendanceCount === 0) {
                    toDelete.push(existing.sessionId);
                }
            }
        }

        // 4. Execute Changes
        if (toDelete.length > 0) {
            await prisma.session.deleteMany({
                where: { sessionId: { in: toDelete } }
            });
        }

        if (toCreate.length > 0) {
            await prisma.session.createMany({
                data: toCreate.map(s => ({
                    assignmentId,
                    sessionDate: s.date,
                    startTime: s.startTime,
                    endTime: s.endTime
                }))
            });
        }
    }

    /**
     * Calculates the "health" of an assignment's attendance.
     * Returns the percentage of elapsed sessions that have recorded attendance.
     */
    static async getAttendanceHealth(assignmentId: number): Promise<{ percentage: number; pendingCount: number; totalSessions: number }> {
        const totalSessions = await prisma.session.count({ where: { assignmentId } });
        if (totalSessions === 0) return { percentage: 100, pendingCount: 0, totalSessions: 0 };

        const now = new Date();
        const elapsedSessions = await prisma.session.findMany({
            where: {
                assignmentId,
                sessionDate: { lte: now }
            },
            select: { sessionId: true, sessionDate: true }
        });

        if (elapsedSessions.length === 0) return { percentage: 100, pendingCount: 0, totalSessions };

        const attendanceRecs = await prisma.attendance.groupBy({
            by: ['sessionDate'],
            where: {
                enrollment: { assignmentId },
                sessionDate: { in: elapsedSessions.map(s => s.sessionDate) }
            },
            _count: { attendanceId: true }
        });

        const recordedCount = attendanceRecs.length;
        const pendingCount = elapsedSessions.length - recordedCount;
        const percentage = Math.round((recordedCount / elapsedSessions.length) * 100);

        return { percentage, pendingCount, totalSessions };
    }
}
