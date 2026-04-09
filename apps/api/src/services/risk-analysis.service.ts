import prisma from '../lib/prisma.js';
import { createNotificationInternal } from '../controllers/notification.controller.js';


export interface RiskResult {
    studentId: number;
    riskScore: number; // 0-100
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    factors: string[];
}

export class RiskAnalysisService {

    /**
     * Analyzes risk for a specific student based on their recent activity.
     * Calibrated weights for educational diagnostic accuracy.
     */
    async analyzeStudentRisk(studentId: number): Promise<RiskResult> {
        const factors: string[] = [];
        let riskScore = 0;




        // 1. Fetch Attendance (Last 5 sessions for better trend)
        const recentAttendance = await prisma.attendance.findMany({
            where: {
                enrollment: {
                    studentId: studentId 
                }
            },
            orderBy: {
                sessionDate: 'desc'
            },
            take: 5
        });

        // 2. Calculate Attendance Risk (Weighted)
        if (recentAttendance.length > 0) {
            let absences = 0;
            let lates = 0;

            recentAttendance.forEach((a) => {
                if (a.status === 'ABSENT' || a.status === 'JUSTIFIED_ABSENCE') absences++;
                if (a.status === 'LATE') lates++;
            });

            // Heavy penalty for frequent absences (>60%)
            if (absences >= 3) {
                riskScore += 50;
                factors.push('Detectado un alto volumen de ausencias recientes');
            } else if (absences >= 1) {
                riskScore += 20;
                factors.push('Se han registrado ausencias ocasionales');
            }

            if (lates >= 3) {
                riskScore += 15;
                factors.push('Problemas persistentes de puntualidad');
            }
        }

        // 3. Fetch Competence Evaluations (Performance)
        const lowEvals = await prisma.competenceEvaluation.findMany({
            where: {
                evaluation: {
                    enrollment: {
                        studentId: studentId
                    }
                },
                score: { lt: 3 }
            }
        });

        if (lowEvals.length > 0) {
            // Normalized weight: max 30 points from performance
            const deduction = Math.min(lowEvals.length * 8, 30);
            riskScore += deduction;
            factors.push(`${lowEvals.length} evaluaciones de competencia bajas`);
        }

        // Cap score
        riskScore = Math.min(riskScore, 100);

        // Determine Level
        let riskLevel: RiskResult['riskLevel'] = 'LOW';
        if (riskScore >= 85) riskLevel = 'CRITICAL';
        else if (riskScore >= 60) riskLevel = 'HIGH';
        else if (riskScore >= 35) riskLevel = 'MEDIUM';

        // 4. Trigger Alert if Critical/High
        if (riskLevel === 'CRITICAL' || riskLevel === 'HIGH') {
            await this.triggerAlert(studentId, riskScore, factors);
        }

        return { studentId, riskScore, riskLevel, factors };
    }

    private async triggerAlert(studentId: number, score: number, factors: string[]) {
        const student = await prisma.student.findUnique({
            where: { id_student: studentId } as any,
            include: { center_origin: true } as any
        }) as any;

        if (!student || !student.id_center_origin) return;

        await createNotificationInternal({
            centerId: student.id_center_origin,
            title: `⚠️ Alerta: Riesgo de Abandono - ${student.nom} ${student.cognoms}`,
            message: `Identificado un nivel de riesgo del ${score}%. Factores principales: ${factors.join(', ')}. Se recomienda intervención pedagógica inmediata.`,
            type: 'SYSTEM',
            importance: 'URGENT'
        });
    }
}
