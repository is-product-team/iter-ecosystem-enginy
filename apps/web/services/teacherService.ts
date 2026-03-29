import getApi from "./api";

export interface Teacher {
  teacherId: number;
  name: string;
  contact: string;
  centerId?: number;
  user?: {
    userId: number;
    email: string;
    fullName?: string;
    photoUrl?: string | null;
  };
}

interface BackendTeacher {
  teacherId: number;
  name: string;
  contact: string;
  centerId: number;
  user?: {
    userId: number;
    email: string;
    fullName: string;
    photoUrl: string | null;
  };
}

const teacherService = {
  getAll: async (): Promise<Teacher[]> => {
    const api = getApi();
    const response = await api.get<BackendTeacher[]>("/teachers");
    return response.data.map((t: BackendTeacher) => ({
      teacherId: t.teacherId,
      name: t.name,
      contact: t.contact,
      centerId: t.centerId,
      user: t.user ? {
        userId: t.user.userId,
        email: t.user.email,
        fullName: t.user.fullName,
        photoUrl: t.user.photoUrl
      } : undefined
    }));
  },
  getByCenter: async (centerId: number): Promise<Teacher[]> => {
    const api = getApi();
    const response = await api.get<BackendTeacher[]>(`/teachers/center/${centerId}`);
    return response.data.map((t: BackendTeacher) => ({
      teacherId: t.teacherId,
      name: t.name,
      contact: t.contact,
      centerId: t.centerId,
      user: t.user ? {
        userId: t.user.userId,
        email: t.user.email,
        fullName: t.user.fullName,
        photoUrl: t.user.photoUrl
      } : undefined
    }));
  },
  create: async (data: Omit<Teacher, 'teacherId'>): Promise<Teacher> => {
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
    try {
      await api.delete(`/teachers/${id}`);
    } catch (error) {
      console.error("Error in teacherService.delete:", error);
      throw error;
    }
  }
};

export default teacherService;
