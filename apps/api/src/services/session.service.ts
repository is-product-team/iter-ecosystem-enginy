import { addWeeks, isSameDay, setDay, nextDay, addDays, getDay, startOfDay } from 'date-fns';
import prisma from '../lib/prisma.js';

export class SessionService {
    /**
     * Generates a list of dates based on a starting date and a list of week days.
     * @param startDate The date to start from.
     * @param schedule Array of days (e.g. ['Dilluns', 'Dimecres'] or ['Lunes', 'Miércoles'])
     * @param totalSessions Total number of sessions to generate.
     */
    static generateDatesFromSchedule(startDate: Date, schedule: string[], totalSessions: number = 10): Date[] {
        if (!schedule || schedule.length === 0) {
            return this.generateSessionDates(startDate, totalSessions);
        }

        const dayMap: Record<string, number> = {
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
     * If not, creates them for all currently enrolled students with status 'Present' (default) or 'Absencia' (to be decided, using Present as neutral initialization).
     * Note: It is better to initialize as 'Present' or wait for input. Let's use 'Present' as default placeholder logic, 
     * or we can check if we want a specific "Pending" state. Use 'Present' for now as per likely requirement.
     */
    static async ensureAttendanceRecords(idAssignment: number, sessionNum: number, date: Date) {
        // 1. Get all enrollments for this assignment
        const enrollments = await prisma.enrollment.findMany({
            where: { id_assignment: idAssignment }
        });

        if (enrollments.length === 0) return;

        // 2. Check which students already have attendance for this session
        const existingAttendance = await prisma.attendance.findMany({
            where: {
                inscripcio: { id_assignment: idAssignment },
                numero_sessio: sessionNum
            },
            select: { id_enrollment: true }
        });

        const existingIds = new Set(existingAttendance.map((a: any) => a.id_enrollment));

        // 3. Create missing records
        const missingEnrollments = enrollments.filter((e: any) => !existingIds.has(e.id_enrollment));

        if (missingEnrollments.length > 0) {
            await prisma.attendance.createMany({
                data: missingEnrollments.map((e: any) => ({
                    id_enrollment: e.id_enrollment,
                    numero_sessio: sessionNum,
                    data_sessio: date,
                    estat: 'Present' // Default state
                }))
            });
        }
    }

    /**
     * Retrieves the status of a session: 'Pending', 'Recorded', or 'Future'.
     * Simple heuristic based on existance of records.
     */
    static async getSessionStatus(idAssignment: number, sessionNum: number): Promise<string> {
        const count = await prisma.attendance.count({
            where: {
                inscripcio: { id_assignment: idAssignment },
                numero_sessio: sessionNum
            }
        });
        return count > 0 ? 'Recorded' : 'Pending';
    }

    /**
     * Synchronizes sessions for an assignment based on its workshop schedule.
     */
    static async syncSessionsForAssignment(idAssignment: number) {
        const assignacio = await prisma.assignment.findUnique({
            where: { id_assignment: idAssignment },
            include: { taller: true }
        });

        if (!assignacio || !assignacio.data_inici) return;

        const schedule = assignacio.workshop.dies_execucio;
        const sessionDates = this.generateDatesFromSchedule(assignacio.data_inici, schedule as any);

        // Delete future sessions that might be outdated
        // Actually, better to just create if they don't exist or update dates
        // For simplicity in Phase 3, we'll re-generate if no attendance exists
        
        const hasAttendance = await prisma.attendance.count({
            where: { inscripcio: { id_assignment: idAssignment } }
        });

        if (hasAttendance > 0) return; // Don't mess with sessions if attendance is already recorded

        // Delete existing sessions
        await prisma.session.deleteMany({
            where: { id_assignment: idAssignment }
        });

        // Create new ones
        await prisma.session.createMany({
            data: sessionDates.map(date => ({
                id_assignment: idAssignment,
                data_sessio: date
            }))
        });
    }
}
