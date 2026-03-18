import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class EvaluationService {
    /**
     * Obtiene la evaluación docente de una inscripción específica.
     */
    async getEvaluationByEnrollment(id_enrollment: number) {
        return await prisma.evaluation.findUnique({
            where: { id_enrollment },
            include: {
                competencies: {
                    include: {
                        competencia: true,
                    },
                },
            },
        });
    }

    /**
     * Crea o actualiza una evaluación docente.
     */
    async upsertEvaluation(data: {
        id_enrollment: number;
        percentatge_asistencia: number;
        numero_retards: number;
        observacions?: string;
        competencies: { id_competencia: number; puntuacio: number }[];
    }) {
        // 1. Crear o actualizar la evaluación docente principal
        const avaluacioDocent = await prisma.evaluation.upsert({
            where: { id_enrollment: data.id_enrollment },
            update: {
                percentatge_asistencia: data.percentatge_asistencia,
                numero_retards: data.numero_retards,
                observacions: data.observacions,
            },
            create: {
                id_enrollment: data.id_enrollment,
                percentatge_asistencia: data.percentatge_asistencia,
                numero_retards: data.numero_retards,
                observacions: data.observacions,
            },
        });

        // 2. Eliminar competencias previas si existen (para re-crearlas)
        await prisma.avaluacioCompetencial.deleteMany({
            where: { id_evaluation_teacher: avaluacioDocent.id_evaluation_teacher },
        });

        // 3. Crear las nuevas puntuaciones de competencias
        const competenciesCreated = await prisma.avaluacioCompetencial.createMany({
            data: data.competences.map((c) => ({
                id_evaluation_teacher: avaluacioDocent.id_evaluation_teacher,
                id_competencia: c.id_competencia,
                puntuacio: c.puntuacio,
            })),
        });

        return { ...avaluacioDocent, competenciesCount: competenciesCreated.count };
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
