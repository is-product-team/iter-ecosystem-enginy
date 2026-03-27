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
     * If not, creates them for all currently enrolled students.
     */
    static async ensureAttendanceRecords(assignmentId: number, sessionNum: number, date: Date) {
        // 1. Get all enrollments for this assignment
        const enrollments = await prisma.enrollment.findMany({
            where: { assignmentId: assignmentId }
        });

        if (enrollments.length === 0) return;

        // 2. Check which students already have attendance for this session
        const existingAttendance = await prisma.attendance.findMany({
            where: {
                enrollment: { assignmentId: assignmentId },
                sessionNumber: sessionNum
            },
            select: { enrollmentId: true }
        });

        const existingIds = new Set(existingAttendance.map((a: any) => a.enrollmentId));

        // 3. Create missing records
        const missingEnrollments = enrollments.filter((e: any) => !existingIds.has(e.enrollmentId));

        if (missingEnrollments.length > 0) {
            await (prisma.attendance as any).createMany({
                data: missingEnrollments.map((e: any) => ({
                    enrollmentId: e.enrollmentId,
                    sessionNumber: sessionNum,
                    sessionDate: date,
                    status: 'PRESENT'
                }))
            });
        }
    }

    /**
     * Retrieves the status of a session: 'Pending', 'Recorded', or 'Future'.
     */
    static async getSessionStatus(assignmentId: number, sessionNum: number): Promise<string> {
        const count = await prisma.attendance.count({
            where: {
                enrollment: { assignmentId: assignmentId },
                sessionNumber: sessionNum
            }
        });
        return count > 0 ? 'Recorded' : 'Pending';
    }

    /**
     * Synchronizes sessions for an assignment based on its workshop schedule.
     */
    static async syncSessionsForAssignment(assignmentId: number) {
        const assignment = await prisma.assignment.findUnique({
            where: { assignmentId: assignmentId },
            include: { workshop: true }
        });

        if (!assignment || !assignment.startDate) return;

        const schedule = assignment.workshop.executionDays;
        const sessionDates = this.generateDatesFromSchedule(assignment.startDate, schedule as any);

        const hasAttendance = await prisma.attendance.count({
            where: { enrollment: { assignmentId: assignmentId } }
        });

        if (hasAttendance > 0) return;

        // Delete existing sessions
        await prisma.session.deleteMany({
            where: { assignmentId: assignmentId }
        });

        // Create new ones
        await (prisma.session as any).createMany({
            data: sessionDates.map(date => ({
                assignmentId: assignmentId,
                sessionDate: date
            }))
        });
    }
}
