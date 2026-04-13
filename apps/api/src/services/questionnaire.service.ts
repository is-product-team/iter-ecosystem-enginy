import prisma from '../lib/prisma.js';

export class QuestionnaireService {
    /**
     * Submit a public survey for a student
     */
    async submitPublicSurvey(data: {
        enrollmentId: number;
        workshopClarity: number;
        materialQuality: number;
        learningInterest: number;
        supportRating: number;
        experienceRating: number;
        teacherRating: number;
        vocationalImpact: string;
        keyLearnings?: string;
    }) {
        const { enrollmentId, ...surveyData } = data;

        // Verify enrollment exists and has no survey yet
        const enrollment = await prisma.enrollment.findUnique({
            where: { enrollmentId },
            include: { selfConsultation: true }
        });

        if (!enrollment) throw new Error('Enrollment not found');
        if (enrollment.selfConsultation) throw new Error('Survey already submitted for this workshop');

        return prisma.studentSelfConsultation.create({
            data: {
                enrollmentId,
                ...surveyData
            }
        });
    }

    /**
     * Get aggregated statistics for a specific assignment
     */
    async getAggregatedStats(assignmentId: number) {
        const aggregations = await prisma.studentSelfConsultation.aggregate({
            where: {
                enrollment: {
                    assignmentId: assignmentId
                }
            },
            _avg: {
                workshopClarity: true,
                materialQuality: true,
                learningInterest: true,
                supportRating: true,
                experienceRating: true,
                teacherRating: true,
            },
            _count: {
                _all: true
            }
        });

        const impactDistribution = await prisma.studentSelfConsultation.groupBy({
            where: {
                enrollment: {
                    assignmentId: assignmentId
                }
            },
            by: ['vocationalImpact'],
            _count: {
                _all: true
            }
        });

        // Get key learnings (last 5 for the card)
        const recentLearnings = await prisma.studentSelfConsultation.findMany({
            where: {
                enrollment: { assignmentId }
            },
            select: { keyLearnings: true },
            take: 5,
            orderBy: { createdAt: 'desc' }
        });

        return {
            averages: aggregations._avg,
            totalResponses: aggregations._count._all,
            impact: impactDistribution.map(id => ({
                name: id.vocationalImpact,
                value: id._count._all
            })),
            learnings: recentLearnings.map(l => l.keyLearnings).filter(Boolean)
        };
    }

    /**
     * Questionnaire System Methods
     */

    async getModels() {
        return prisma.questionnaireModel.findMany({
            include: { questions: true }
        });
    }

    async createModel(data: any) {
        const { name, target, questions } = data;
        return prisma.questionnaireModel.create({
            data: {
                name,
                target,
                questions: {
                    create: questions
                }
            },
            include: { questions: true }
        });
    }

    async getModelById(modelId: number) {
        return prisma.questionnaireModel.findUnique({
            where: { modelId },
            include: { questions: true }
        });
    }

    async trackSubmission(assignmentId: number, target: any) {
        // Find if a questionnaire already exists for this assignment/target
        // Or generate a new one with a token
        const token = Math.random().toString(36).substring(2, 15);
        return prisma.questionnaire.create({
            data: {
                assignmentId,
                target,
                token,
                isCompleted: false
            }
        });
    }

    async submitResponses(token: string, responses: any[]) {
        const questionnaire = await prisma.questionnaire.findUnique({
            where: { token }
        });

        if (!questionnaire) throw new Error('Questionnaire not found');
        if (questionnaire.isCompleted) throw new Error('Already submitted');

        await prisma.$transaction([
            ...responses.map(resp => prisma.questionnaireResponse.create({
                data: {
                    questionnaireId: questionnaire.questionnaireId,
                    questionId: resp.questionId,
                    value: String(resp.value)
                }
            })),
            prisma.questionnaire.update({
                where: { questionnaireId: questionnaire.questionnaireId },
                data: { isCompleted: true, completedAt: new Date() }
            })
        ]);

        return { success: true };
    }

    async submitStudentSelfConsultation(data: any) {
        return this.submitPublicSurvey(data);
    }

    async getSatisfactionMetrics() {
        // Global metrics (reusing the aggregation logic without assignment filter)
        const aggregations = await prisma.studentSelfConsultation.aggregate({
            _avg: {
                workshopClarity: true,
                materialQuality: true,
                learningInterest: true,
                supportRating: true,
                experienceRating: true,
                teacherRating: true,
            },
            _count: {
                _all: true
            }
        });

        return {
            globalAverages: aggregations._avg,
            totalSubmissions: aggregations._count._all
        };
    }
}
