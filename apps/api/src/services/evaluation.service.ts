import prisma from '../lib/prisma.js';

export class EvaluationService {
    /**
     * Retrieves the teacher evaluation for a specific enrollment.
     */
    async getEvaluationByEnrollment(enrollmentId: number) {
        return await prisma.evaluation.findUnique({
            where: { enrollmentId },
            include: {
                competences: {
                    include: {
                        competence: true,
                    },
                },
            },
        });
    }

    /**
     * Creates or updates a teacher evaluation.
     */
    async upsertEvaluation(data: {
        enrollmentId: number;
        assignmentId: number;
        attendancePercentage: number;
        lateCount: number;
        observations?: string;
        competences: { competenceId: number; score: number }[];
    }) {
        const {
            enrollmentId,
            assignmentId,
            attendancePercentage,
            lateCount,
            observations,
            competences
        } = data;

        // 1. Create or update the main teacher evaluation
        const teacherEvaluation = await prisma.evaluation.upsert({
            where: { enrollmentId },
            update: {
                attendancePercentage,
                lateCount,
                observations,
            },
            create: {
                enrollmentId,
                assignmentId,
                attendancePercentage,
                lateCount,
                observations: observations,
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
     * MOCK AI: Simulates Speech-to-Text and sentiment/score analysis.
     * In a real version, this would call OpenAI or a similar service.
     */
    async analyzeObservationsAI(text: string) {
        // Simulation delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock logic: looks for keywords to suggest scores
        const keywordsPositive = ['good', 'excellent', 'well', 'disciplined', 'responsible', 'proactive', 'bueno', 'excelente', 'bien', 'responsable'];
        const keywordsNegative = ['bad', 'missing', 'attention', 'distracted', 'passive', 'mal', 'falta', 'atención', 'distraído', 'pasivo'];

        let scoreSuggestion = 3; // Sufficient by default

        const words = text.toLowerCase().split(/\s+/);
        const positiveCount = words.filter(w => keywordsPositive.includes(w)).length;
        const negativeCount = words.filter(w => keywordsNegative.includes(w)).length;

        if (positiveCount > negativeCount) scoreSuggestion = 4 + (positiveCount > 3 ? 1 : 0);
        if (negativeCount > positiveCount) scoreSuggestion = 2 - (negativeCount > 3 ? 1 : 0);

        return {
            transcription: text,
            sentiment: positiveCount >= negativeCount ? 'Positive' : 'Negative',
            suggestedScore: Math.max(1, Math.min(5, scoreSuggestion)),
            summary: `Automated analysis: The student shows a ${positiveCount >= negativeCount ? 'favorable' : 'to-be-improved'} attitude.`
        };
    }

    /**
     * Retrieves all available competencies in the system.
     */
    async getCompetencies() {
        return await prisma.competence.findMany();
    }
}
