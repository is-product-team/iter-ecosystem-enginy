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
                    attendance_percentage: d.percentatge_asistencia,
                    delay_count: d.numero_retards,
                    observations: d.observacions,
                    competencies: d.competences?.map((c: { id_competence: number, puntuacio: number }) => ({
                        id_competence: c.id_competence,
                        score: c.puntuacio
                    }))
                }
            };
        }
        return response;
    },

    upsertEvaluation: (data: { enrollmentId: number, attendance_percentage: number, delay_count: number, observations: string, competencies: { id_competence: number, score: number }[] }) =>
        api.post('/evaluation/upsert', {
            id_enrollment: data.enrollmentId,
            percentatge_asistencia: data.attendance_percentage,
            numero_retards: data.delay_count,
            observacions: data.observations,
            competencies: data.competencies?.map((c: { id_competence: number, score: number }) => ({
                id_competencia: c.id_competence,
                puntuacio: c.score
            }))
        }),

    getCompetencies: async () => {
        const response = await api.get('/evaluation/competencies');
        return {
            ...response,
            data: response.data.map((c: { id_competence: number, nom: string, tipus: string, descripcio?: string }) => ({
                id_competence: c.id_competence,
                name: c.nom,
                type: c.tipus,
                description: c.descripcio || ''
            }))
        };
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
