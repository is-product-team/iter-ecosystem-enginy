import getApi from './api';

const api = getApi();

export const evaluationService = {
    getEvaluationEnrollment: async (enrollmentId: number) => {
        const response = await api.get(`/evaluation/enrollment/${enrollmentId}`);
        if (response.data) {
            const d = response.data;
            return {
                ...response,
                data: {
                    attendancePercentage: d.attendancePercentage,
                    lateCount: d.lateCount,
                    observations: d.observations,
                    competencies: d.competencies?.map((c: { competenceId: number, score: number }) => ({
                        competenceId: c.competenceId,
                        score: c.score
                    }))
                }
            };
        }
        return response;
    },

    upsertEvaluation: (data: { enrollmentId: number, attendancePercentage: number, lateCount: number, observations: string, competencies: { competenceId: number, score: number }[] }) =>
        api.post('/evaluation/upsert', {
            enrollmentId: data.enrollmentId,
            attendancePercentage: data.attendancePercentage,
            lateCount: data.lateCount,
            observations: data.observations,
            competencies: data.competencies
        }),

    getCompetencies: async () => {
        const response = await api.get('/evaluation/competencies');
        return response; // Backend already returns { name, type, description }
    },

    getModels: () =>
        api.get('/questionnaires/models'),

    analyzeObservations: (text: string) =>
        api.post('/evaluation/analyze', { text }),

    submitSelfConsultation: (data: Record<string, unknown>) =>
        api.post('/questionnaires/self-consultation', data),

    getReports: () =>
        api.get('/questionnaires/reports'),
};
