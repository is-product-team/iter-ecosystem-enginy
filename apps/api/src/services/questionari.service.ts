import { PrismaClient, QuestionnaireTarget, ResponseType } from '@prisma/client';
import * as uuid from 'uuid';
const { v4: uuidv4 } = uuid;

const prisma = new PrismaClient();

export class QuestionariService {
    async getModels() {
        return await prisma.questionnaireModel.findMany({
            include: { _count: { select: { questions: true } } }
        });
    }

    async getModelById(modelId: number) {
        return await prisma.questionnaireModel.findUnique({
            where: { modelId: modelId },
            include: { questions: true },
        });
    }

    async createModel(data: {
        name: string;
        target: QuestionnaireTarget;
        questions: { text: string; type: ResponseType; options?: any }[];
    }) {
        return await prisma.questionnaireModel.create({
            data: {
                name: data.name,
                target: data.target,
                questions: {
                    create: data.questions.map(q => ({
                        text: q.text,
                        type: q.type,
                        options: q.options
                    })),
                },
            },
            include: { questions: true },
        });
    }

    async trackEnviament(assignmentId: number, target: QuestionnaireTarget) {
        return await prisma.questionnaire.create({
            data: {
                assignmentId,
                target,
                token: uuidv4(),
                isCompleted: false
            },
        });
    }

    async submitResponses(token: string, responses: { questionId: number; value: string }[]) {
        const questionnaire = await prisma.questionnaire.findUnique({
            where: { token }
        });

        if (!questionnaire) throw new Error('Questionnaire not found');

        await prisma.questionnaire.update({
            where: { questionnaireId: questionnaire.questionnaireId },
            data: {
                isCompleted: true,
                completedAt: new Date(),
            },
        });

        return await prisma.questionnaireResponse.createMany({
            data: responses.map((r) => ({
                questionnaireId: questionnaire.questionnaireId,
                questionId: r.questionId,
                value: r.value,
            })),
        });
    }

    async submitAutoconsultaStudent(data: any) {
        return await prisma.studentSelfConsultation.create({
            data: {
                enrollmentId: data.enrollmentId,
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
