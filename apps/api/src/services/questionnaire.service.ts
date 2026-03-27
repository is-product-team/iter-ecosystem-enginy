import { PrismaClient, QuestionnaireTarget, ResponseType } from '@prisma/client';
import * as uuid from 'uuid';
const { v4: uuidv4 } = uuid;

const prisma = new PrismaClient();

export class QuestionnaireService {
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

    async trackSubmission(assignmentId: number, target: QuestionnaireTarget) {
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

    async submitStudentSelfConsultation(data: any) {
        return await prisma.studentSelfConsultation.create({
            data: {
                enrollmentId: data.enrollmentId,
                taskPunctuality: data.taskPunctuality,
                respectForMaterial: data.respectForMaterial,
                learningInterest: data.learningInterest,
                resolutionAutonomy: data.resolutionAutonomy,
                experienceRating: data.experienceRating,
                teacherRating: data.teacherRating,
                vocationalImpact: data.vocationalImpact,
                personalImprovements: data.personalImprovements,
                keyLearnings: data.keyLearnings,
            },
        });
    }

    async getSatisfactionMetrics() {
        const avgStats = await prisma.studentSelfConsultation.aggregate({
            _avg: {
                experienceRating: true,
                teacherRating: true,
            },
        });

        const impactStats = await prisma.studentSelfConsultation.groupBy({
            by: ['vocationalImpact'],
            _count: {
                _all: true,
            },
        });

        return {
            generalAvg: avgStats._avg,
            impactDistribution: impactStats,
        };
    }
}
