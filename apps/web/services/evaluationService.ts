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
                    competencies: d.competences?.map((c: { id_competence: number, score: number }) => ({
                        id_competence: c.id_competence,
                        score: c.score
                    }))
                }
            };
        }
        return response;
    },

    upsertEvaluation: (data: { enrollmentId: number, attendancePercentage: number, lateCount: number, observations: string, competencies: { id_competence: number, score: number }[] }) =>
        api.post('/evaluation/upsert', {
            id_enrollment: data.enrollmentId,
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

    submitAutoconsulta: (data: Record<string, unknown>) =>
        api.post('/questionnaires/autoconsulta', data),

    getReports: () =>
        api.get('/questionnaires/reports'),
};
