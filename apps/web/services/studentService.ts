import getApi from "./api";

export interface Student {
  id_student: number;
  fullName: string;
  lastName: string;
  idalu: string;
  grade: string;
  originCenterId?: number;
  photoUrl?: string | null;
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
