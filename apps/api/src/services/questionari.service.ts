import { PrismaClient, QuestionnaireTarget } from '@prisma/client';

const prisma = new PrismaClient();

export class QuestionariService {
    /**
     * Obtiene un modelo de cuestionario por ID.
     */
    async getModels() {
        return await prisma.modelQuestionari.findMany({
            include: { _count: { select: { questions: true } } }
        });
    }

    async getModelById(id_model: number) {
        return await prisma.modelQuestionari.findUnique({
            where: { id_model },
            include: { questions: true },
        });
    }

    /**
     * Crea un nuevo modelo de cuestionario dinámico.
     */
    async createModel(data: {
        titol: string;
        destinatari: QuestionnaireTarget;
        questions: { enunciat: string; tipus_resposta: any; opcions?: any }[];
    }) {
        return await prisma.modelQuestionari.create({
            data: {
                titol: data.titol,
                destinatari: data.destinatari,
                questions: {
                    create: data.preguntes,
                },
            },
            include: { questions: true },
        });
    }

    /**
     * Registra el envío de un cuestionario para una asignación.
     */
    async trackEnviament(id_model: number, id_assignment: number) {
        return await prisma.enviamentQuestionari.create({
            data: {
                id_model,
                id_assignment,
                estat: 'Enviat',
                data_enviament: new Date(),
            },
        });
    }

    /**
     * Registra las respuestas de un cuestionario enviado.
     */
    async submitRespostes(id_enviament: number, responses: { id_pregunta: number; valor: string }[]) {
        // 1. Marcar como respondido
        await prisma.enviamentQuestionari.update({
            where: { id_enviament },
            data: {
                estat: 'Respost',
                data_resposta: new Date(),
            },
        });

        // 2. Crear las respuestas
        return await prisma.respostesQuestionari.createMany({
            data: respostes.map((r) => ({
                id_enviament,
                id_pregunta: r.id_pregunta,
                valor: r.valor,
            })),
        });
    }

    /**
     * Guarda la autoevaluación de un alumno.
     */
    async submitAutoconsultaStudent(data: any) {
        return await prisma.autoconsultaStudent.create({
            data: {
                id_enrollment: data.id_enrollment,
                puntualitat_tasques: data.puntualitat_tasques,
                respecte_material: data.respecte_material,
                interes_aprenentatge: data.interes_aprenentatge,
                autonomia_resolucio: data.autonomia_resolucio,
                valoracio_experiencia: data.valoracio_experiencia,
                valoracio_docent: data.valoracio_docent,
                impacte_vocacional: data.impacte_vocacional,
                millores_personals: data.millores_personals,
                aprenentatges_clau: data.aprenentatges_clau,
            },
        });
    }

    /**
     * Genera métricas generales de satisfacción.
     */
    async getSatisfactionMetrics() {
        // Media de valoraciones de alumnos
        const avgStats = await prisma.autoconsultaStudent.aggregate({
            _avg: {
                valoracio_experiencia: true,
                valoracio_docent: true,
            },
        });

        // Conteo por impacto vocacional
        const impactStats = await prisma.autoconsultaStudent.groupBy({
            by: ['impacte_vocacional'],
            _count: {
                _all: true,
            },
        });

        return {
            general_avg: avgStats._avg,
            impact_distribution: impactStats,
        };
    }
}
