import getApi from "./api";

export interface Student {
  id_student: number;
  name: string;
  surnames: string;
  idalu: string;
  course: string;
  id_center_origin?: number;
  url_foto?: string | null;
}

const studentService = {
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

export default studentService;
