import getApi from "./api";

export interface Professor {
  id_professor: number;
  nom: string;
  contacte: string;
  id_centre?: number;
  usuari?: {
    id_usuari: number;
    email: string;
    nom_complet?: string;
    url_foto?: string | null;
  };
}

const professorService = {
  getAll: async (): Promise<Professor[]> => {
    const api = getApi();
    const response = await api.get<Professor[]>("/teachers");
    return response.data;
  },
  create: async (data: Omit<Professor, 'id_professor'>): Promise<Professor> => {
    const api = getApi();
    const response = await api.post<Professor>("/teachers", data);
    return response.data;
  },
  update: async (id: number, data: Partial<Professor>): Promise<Professor> => {
    const api = getApi();
    const response = await api.put<Professor>(`/teachers/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    const api = getApi();
    await api.delete(`/teachers/${id}`);
  }
};

export default professorService;
