import getApi from './api';

const api = getApi();

export const avaluacioService = {
    getAvaluacioEnrollment: (id_enrollment: number) =>
        api.get(`/evaluation/inscripcio/${id_enrollment}`),

    upsertAvaluacio: (data: any) =>
        api.post('/evaluation/upsert', data),

    getCompetencies: () =>
        api.get('/evaluation/competencies'),

    getModels: () =>
        api.get('/questionnaires/models'),

    analyzeObservations: (text: string) =>
        api.post('/evaluation/analyze', { text }),

    submitAutoconsulta: (data: any) =>
        api.post('/questionnaires/autoconsulta', data),

    getReports: () =>
        api.get('/questionnaires/reports'),
};
