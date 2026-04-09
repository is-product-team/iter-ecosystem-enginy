import prisma from '../lib/prisma.js';

export class EvaluationService {
    /**
     * Retrieves the teacher evaluation for a specific enrollment, 
     * including REAL-TIME calculated attendance statistics.
     */
    async getEvaluationByEnrollment(enrollmentId: number) {
        const evaluation = await prisma.evaluation.findUnique({
            where: { enrollmentId },
            include: {
                competences: {
                    include: {
                        competence: true,
                    },
                },
            },
        });

        // Calculate real stats from Attendance table
        const stats = await this.calculateAttendanceStats(enrollmentId);

        if (!evaluation) {
            // Return initial data skeleton with real stats
            return {
                enrollmentId,
                attendancePercentage: stats.percentage,
                lateCount: stats.lateCount,
                observations: '',
                competences: [],
                isNew: true
            };
        }

        return {
            ...evaluation,
            attendancePercentage: stats.percentage, // Override with real-time data
            lateCount: stats.lateCount,
            isNew: false
        };
    }

    /**
     * Calculates real attendance statistics for an enrollment.
     */
    async calculateAttendanceStats(enrollmentId: number) {
        const enrollment = await prisma.enrollment.findUnique({
            where: { enrollmentId },
            include: {
                assignment: {
                    include: {
                        sessions: true
                    }
                },
                attendance: true
            }
        });

        if (!enrollment) return { percentage: 0, lateCount: 0 };

        const totalSessions = enrollment.assignment.sessions.length;
        if (totalSessions === 0) return { percentage: 100, lateCount: 0 };

        const presentCount = enrollment.attendance.filter(a => 
            a.status === 'PRESENT' || a.status === 'LATE'
        ).length;

        const lateCount = enrollment.attendance.filter(a => a.status === 'LATE').length;
        const percentage = Math.round((presentCount / totalSessions) * 100);

        return { percentage, lateCount };
    }

    /**
     * Creates or updates a teacher evaluation.
     */
    async upsertEvaluation(data: {
        enrollmentId: number;
        assignmentId: number;
        observations?: string;
        competences: { competenceId: number; score: number }[];
    }) {
        const {
            enrollmentId,
            assignmentId,
            observations,
            competences
        } = data;

        // 0. Auto-calculate stats to ensure consistency
        const stats = await this.calculateAttendanceStats(enrollmentId);

        // 1. Create or update the main teacher evaluation
        const teacherEvaluation = await prisma.evaluation.upsert({
            where: { enrollmentId },
            update: {
                attendancePercentage: stats.percentage,
                lateCount: stats.lateCount,
                observations,
            },
            create: {
                enrollmentId,
                assignmentId,
                attendancePercentage: stats.percentage,
                lateCount: stats.lateCount,
                observations: observations || '',
            },
        });

        // 2. Delete previous competences if they exist (to re-create them)
        await prisma.competenceEvaluation.deleteMany({
            where: { evaluationId: teacherEvaluation.evaluationId },
        });

        // 3. Create new competence scores
        const competencesCreated = await prisma.competenceEvaluation.createMany({
            data: competences.map((c) => ({
                evaluationId: teacherEvaluation.evaluationId,
                competenceId: c.competenceId,
                score: c.score,
            })),
        });

        return { ...teacherEvaluation, competencesCount: competencesCreated.count };
    }

    /**
     * Uses the local NLP Service (Ollama) to analyze teacher observations.
     * Extracts state, sentiment and score suggestion.
     */
    async analyzeObservationsAI(text: string) {
        const { NLPService } = await import('./nlp.service.js');
        const nlp = new NLPService();
        
        try {
            const result = await nlp.processText(text);
            
            return {
                transcription: text,
                sentiment: result.attendanceStatus === 'ABSENT' || (result.competenceUpdate && result.competenceUpdate.score < 3) ? 'Negative' : 'Positive',
                suggestedScore: result.competenceUpdate?.score || 3,
                summary: `AI Audit: ${result.attendanceStatus || 'Present'}. ${result.competenceUpdate?.reason || 'No specific competence mentioned.'}`
            };
        } catch (error) {
            console.error("AI Analysis Failed:", error);
            return {
                transcription: text,
                sentiment: 'Neutral',
                suggestedScore: 3,
                summary: 'AI Analysis currently unavailable. Defaulting to neutral values.'
            };
        }
    }

    /**
     * Retrieves all available competencies in the system.
     */
    async getCompetencies() {
        return await prisma.competence.findMany();
    }
}
