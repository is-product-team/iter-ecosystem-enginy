import getApi from "./api";

export interface TeacherSatisfactionMetrics {
  teacherAverages: Record<string, number>;
  totalTeacherSubmissions: number;
}

const questionnaireService = {
  getReports: async (): Promise<any> => {
    const api = getApi();
    const response = await api.get("/questionnaires/reports");
    return response.data;
  },

  getEvaluationsList: async (): Promise<any[]> => {
    const api = getApi();
    const response = await api.get("/questionnaires/evaluations/list");
    return response.data;
  },

  getAssignmentEvaluation: async (assignmentId: number): Promise<any> => {
    const api = getApi();
    const response = await api.get(`/questionnaires/assignment/${assignmentId}`);
    return response.data;
  },
};

export default questionnaireService;
