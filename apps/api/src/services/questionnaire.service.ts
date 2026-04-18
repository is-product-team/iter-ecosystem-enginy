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

    async getSatisfactionMetrics(centerId?: number) {
        try {
            const whereClause: any = {};
            if (centerId) {
                whereClause.enrollment = {
                    assignment: { centerId: centerId }
                };
            }

            // 1. Student Self-Consultation Metrics
            const studentAggregations = await prisma.studentSelfConsultation.aggregate({
                where: whereClause,
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

            // 2. Teacher Evaluation Metrics
            const teacherWhere: any = {
                questionnaire: { 
                    target: 'TEACHER', 
                    isCompleted: true
                },
                question: { type: 'RATING' }
            };

            if (centerId) {
                teacherWhere.questionnaire.assignment = { centerId: centerId };
            }

            const teacherRatings = await prisma.questionnaireResponse.findMany({
                where: teacherWhere,
                select: {
                    value: true,
                    questionnaireId: true,
                    question: { select: { text: true } }
                }
            });

            const teacherAverages: Record<string, number> = {};
            const sums: Record<string, { s: number, c: number }> = {};
            const uniqueQuestionnaires = new Set();

            teacherRatings.forEach(r => {
                uniqueQuestionnaires.add(r.questionnaireId);
                const val = parseInt(r.value);
                if (!isNaN(val)) {
                    if (!sums[r.question.text]) sums[r.question.text] = { s: 0, c: 0 };
                    sums[r.question.text].s += val;
                    sums[r.question.text].c += 1;
                }
            });

            Object.keys(sums).forEach(key => {
                teacherAverages[key] = sums[key].s / sums[key].c;
            });

            return {
                globalAverages: studentAggregations._avg,
                totalSubmissions: studentAggregations._count._all,
                teacherAverages,
                totalTeacherSubmissions: uniqueQuestionnaires.size
            };
        } catch (error: any) {
            console.error("❌ [QuestionnaireService] Error in getSatisfactionMetrics:", error);
            throw new Error(`Failed to aggregate satisfaction metrics: ${error.message}`);
        }
    }

    async getAssignmentResponses(assignmentId: number) {
        // Get the teacher's questionnaire for this assignment
        const questionnaire = await prisma.questionnaire.findFirst({
            where: {
                assignmentId,
                target: 'TEACHER',
                isCompleted: true
            },
            include: {
                responses: {
                    include: {
                        question: true
                    }
                }
            }
        });

        if (!questionnaire) return null;

        return questionnaire.responses.map(r => ({
            question: r.question.text,
            type: r.question.type,
            value: r.value
        }));
    }

    async getEvaluationsList(centerId?: number) {
        const whereClause: any = {
            target: 'TEACHER',
            isCompleted: true
        };

        if (centerId) {
            whereClause.assignment = { centerId };
        }

        const questionnaires = await prisma.questionnaire.findMany({
            where: whereClause,
            include: {
                assignment: {
                    include: {
                        workshop: true,
                        teachers: {
                            include: {
                                user: {
                                    select: { fullName: true }
                                }
                            }
                        }
                    }
                },
                responses: {
                    include: {
                        question: true
                    }
                }
            },
            orderBy: {
                completedAt: 'desc'
            }
        });

        return questionnaires.map(q => {
            const metrics: Record<string, string | number> = {};
            q.responses.forEach(r => {
                if (r.question.type === 'RATING') {
                    metrics[r.question.text] = parseInt(r.value);
                } else {
                    metrics[r.question.text] = r.value;
                }
            });

            return {
                questionnaireId: q.questionnaireId,
                assignmentId: q.assignmentId,
                workshopTitle: q.assignment.workshop.title,
                modality: q.assignment.workshop.modality,
                teacherName: q.assignment.teachers.find(t => t.isPrincipal)?.user.fullName || q.assignment.teachers[0]?.user.fullName || 'N/A',
                date: q.completedAt,
                metrics
            };
        });
    }
}
