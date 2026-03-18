import getApi from "./api";

export interface Alumne {
  id_alumne: number;
  nom: string;
  cognoms: string;
  idalu: string;
  curs: string;
  id_centre_procedencia?: number;
  url_foto?: string | null;
}

const alumneService = {
  getAll: async (): Promise<Alumne[]> => {
    const api = getApi();
    const response = await api.get<Alumne[]>("/students");
    return response.data;
  },
  create: async (data: Omit<Alumne, 'id_alumne'>): Promise<Alumne> => {
    const api = getApi();
    const response = await api.post<Alumne>("/students", data);
    return response.data;
  },
  update: async (id: number, data: Partial<Alumne>): Promise<Alumne> => {
    const api = getApi();
    const response = await api.put<Alumne>(`/students/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    const api = getApi();
    await api.delete(`/students/${id}`);
  }
};

export default alumneService;
