import prisma from '../lib/prisma.js';

export class EvaluationService {
    /**
     * Obtiene la evaluación docente de una inscripción específica.
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
     * Crea o actualiza una evaluación docente.
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

        // 1. Crear o actualizar la evaluación docente principal
        const avaluacioDocent = await prisma.evaluation.upsert({
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
                observations: data.observations,
            },
        });

        // 2. Eliminar competencias previas si existen (para re-crearlas)
        await prisma.competenceEvaluation.deleteMany({
            where: { evaluationId: avaluacioDocent.evaluationId },
        });

        // 3. Crear las nuevas puntuaciones de competencias
        const competencesCreated = await prisma.competenceEvaluation.createMany({
            data: competences.map((c) => ({
                evaluationId: avaluacioDocent.evaluationId,
                competenceId: c.competenceId,
                score: c.score,
            })),
        });

        return { ...avaluacioDocent, competencesCount: competencesCreated.count };
    }

    /**
     * MOCK AI: Simula el análisis de Speech-to-Text y sentimientos/puntuaciones.
     * En una versión real, esto llamaría a OpenAI o un servicio similar.
     */
    async analyzeObservationsAI(text: string) {


        // Simulación de delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Lógica de mock: busca palabras clave para sugerir puntuaciones
        const keywordsPositive = ['bueno', 'excelente', 'bien', 'disciplinado', 'responsable', 'proactivo'];
        const keywordsNegative = ['mal', 'falta', 'atención', 'distraído', 'pasivo'];

        let scoreSuggestion = 3; // Suficiente por defecto

        const words = text.toLowerCase().split(/\s+/);
        const positiveCount = words.filter(w => keywordsPositive.includes(w)).length;
        const negativeCount = words.filter(w => keywordsNegative.includes(w)).length;

        if (positiveCount > negativeCount) scoreSuggestion = 4 + (positiveCount > 3 ? 1 : 0);
        if (negativeCount > positiveCount) scoreSuggestion = 2 - (negativeCount > 3 ? 1 : 0);

        return {
            transcription: text,
            sentiment: positiveCount >= negativeCount ? 'Positive' : 'Negative',
            suggestedScore: Math.max(1, Math.min(5, scoreSuggestion)),
            summary: `Análisis automático: El alumno muestra una actitud ${positiveCount >= negativeCount ? 'favorable' : 'a mejorar'}.`
        };
    }

    /**
     * Obtiene todas las competencias disponibles en el sistema.
     */
    async getCompetencies() {
        return await prisma.competence.findMany();
    }
}
