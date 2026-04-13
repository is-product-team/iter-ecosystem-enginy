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
}
