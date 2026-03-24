import { PrismaClient, QuestionnaireTarget, ResponseType } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export class QuestionariService {
    async getModels() {
        return await prisma.questionnaireModel.findMany({
            include: { _count: { select: { questions: true } } }
        });
    }

    async getModelById(id_model: number) {
        return await prisma.questionnaireModel.findUnique({
            where: { id_model },
            include: { questions: true },
        });
    }

    async createModel(data: {
        nom: string;
        destinatari: QuestionnaireTarget;
        questions: { text: string; tipus: ResponseType; opcions?: any }[];
    }) {
        return await prisma.questionnaireModel.create({
            data: {
                nom: data.nom,
                destinatari: data.destinatari,
                questions: {
                    create: data.questions,
                },
            },
            include: { questions: true },
        });
    }

    async trackEnviament(id_assignment: number, destinatari: QuestionnaireTarget) {
        return await prisma.questionnaire.create({
            data: {
                id_assignment,
                destinatari,
                token: uuidv4(),
                completa: false
            },
        });
    }

    async submitResponses(token: string, responses: { id_question: number; valor: string }[]) {
        const questionnaire = await prisma.questionnaire.findUnique({
            where: { token }
        });

        if (!questionnaire) throw new Error('Questionnaire not found');

        await prisma.questionnaire.update({
            where: { id_questionnaire: questionnaire.id_questionnaire },
            data: {
                completa: true,
                data_completat: new Date(),
            },
        });

        return await prisma.questionnaireResponse.createMany({
            data: responses.map((r) => ({
                id_questionnaire: questionnaire.id_questionnaire,
                id_question: r.id_question,
                valor: r.valor,
            })),
        });
    }

    async submitAutoconsultaStudent(data: any) {
        return await prisma.studentSelfConsultation.create({
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

    async getSatisfactionMetrics() {
        const avgStats = await prisma.studentSelfConsultation.aggregate({
            _avg: {
                valoracio_experiencia: true,
                valoracio_docent: true,
            },
        });

        const impactStats = await prisma.studentSelfConsultation.groupBy({
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
