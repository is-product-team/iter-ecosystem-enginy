import getApi from "./api";

export interface Student {
  id_student: number;
  nom: string;
  cognoms: string;
  idalu: string;
  curs: string;
  id_center_procedencia?: number;
  url_foto?: string | null;
}

const alumneService = {
  getAll: async (): Promise<Student[]> => {
    const api = getApi();
    const response = await api.get<Student[]>("/students");
    return response.data;
  },
  create: async (data: Omit<Student, 'id_student'>): Promise<Student> => {
    const api = getApi();
    const response = await api.post<Student>("/students", data);
    return response.data;
  },
  update: async (id: number, data: Partial<Student>): Promise<Student> => {
    const api = getApi();
    const response = await api.put<Student>(`/students/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    const api = getApi();
    await api.delete(`/students/${id}`);
  }
};

export default alumneService;
