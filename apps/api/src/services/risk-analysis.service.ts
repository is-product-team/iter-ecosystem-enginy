import prisma from '../lib/prisma.js';
import { createNotificationInterna } from '../controllers/notificacio.controller.js';

export interface RiskResult {
    studentId: number;
    riskScore: number; // 0-100
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    factors: string[];
}

export class RiskAnalysisService {

    /**
     * Analyzes risk for a specific student based on their recent activity.
     */
    async analyzeStudentRisk(studentId: number): Promise<RiskResult> {
        const factors: string[] = [];
        let riskScore = 0;

        // 1. Fetch Attendance (Last 5 sessions)
        const recentAttendance = await prisma.attendance.findMany({
            where: {
                enrollment: { id_student: studentId }
            },
            orderBy: { data_session: 'desc' },
            take: 5
        });

        // 2. Calculate Attendance Risk
        if (recentAttendance.length > 0) {
            let absences = 0;
            let late = 0;

            recentAttendance.forEach((a: any) => {
                if (a.estat === 'Absencia') absences++;
                if (a.estat === 'Retard') late++;
            });

            if (absences >= 2) {
                riskScore += 40;
                factors.push('Multiple unjustified absences in recent sessions');
            } else if (absences === 1) {
                riskScore += 15;
            }

            if (late >= 2) {
                riskScore += 10;
                factors.push('Persistent tardiness');
            }
        }

        // 3. Fetch Competence Evaluations (Low engagement?)
        const lowEvaluations = await prisma.competenceEvaluation.count({
            where: {
                evaluation: {
                    enrollment: { id_student: studentId }
                },
                puntuacio: { lt: 3 }
            }
        });

        if (lowEvaluations > 0) {
            riskScore += (lowEvaluations * 10);
            factors.push(`Found ${lowEvaluations} low competency evaluations`);
        }

        // Cap score
        if (riskScore > 100) riskScore = 100;

        // Determine Level
        let riskLevel: RiskResult['riskLevel'] = 'LOW';
        if (riskScore >= 80) riskLevel = 'CRITICAL';
        else if (riskScore >= 50) riskLevel = 'HIGH';
        else if (riskScore >= 30) riskLevel = 'MEDIUM';

        // 4. Trigger Alert if Critical
        if (riskLevel === 'CRITICAL' || riskLevel === 'HIGH') {
            await this.triggerAlert(studentId, riskScore, factors);
        }

        return { studentId, riskScore, riskLevel, factors };
    }

    private async triggerAlert(studentId: number, score: number, factors: string[]) {
        // Find Student Info
        const student = await prisma.student.findUnique({
            where: { id_student: studentId },
            include: { center_origin: true }
        });

        if (!student || !student.center_origin) return;

        await createNotificationInterna({
            id_center: student.center_origin.id_center,
            titol: `⚠️ Alerta de Riesgo: ${student.nom} ${student.cognoms}`,
            missatge: `El alumno presenta un riesgo de abandono del ${score}%. Factores: ${factors.join(', ')}. Se recomienda intervención.`,
            tipus: 'SISTEMA',
            importancia: 'URGENT'
        });
    }
}
