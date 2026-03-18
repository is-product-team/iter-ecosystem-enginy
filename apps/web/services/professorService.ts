import getApi from "./api";

export interface Teacher {
  id_professor: number;
  nom: string;
  contacte: string;
  id_center?: number;
  usuari?: {
    id_user: number;
    email: string;
    nom_complet?: string;
    url_foto?: string | null;
  };
}

const professorService = {
  getAll: async (): Promise<Teacher[]> => {
    const api = getApi();
    const response = await api.get<Teacher[]>("/teachers");
    return response.data;
  },
  create: async (data: Omit<Teacher, 'id_professor'>): Promise<Teacher> => {
    const api = getApi();
    const response = await api.post<Teacher>("/teachers", data);
    return response.data;
  },
  update: async (id: number, data: Partial<Teacher>): Promise<Teacher> => {
    const api = getApi();
    const response = await api.put<Teacher>(`/teachers/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    const api = getApi();
    await api.delete(`/teachers/${id}`);
  }
};

export default professorService;
