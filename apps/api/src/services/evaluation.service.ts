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
