import getApi from "./api";

export interface Teacher {
  id_teacher: number;
  name: string;
  contact: string;
  id_center?: number;
  user?: {
    id_user: number;
    email: string;
    nom_complet?: string;
    url_foto?: string | null;
  };
}

interface BackendTeacher {
  id_professor: number;
  nom: string;
  contacte: string;
  id_center: number;
  user?: {
    id_user: number;
    email: string;
    nom_complet: string;
    url_foto: string | null;
  };
}

const teacherService = {
  getAll: async (): Promise<Teacher[]> => {
    const api = getApi();
    const response = await api.get<BackendTeacher[]>("/teachers");
    return response.data.map((t: BackendTeacher) => ({
      id_teacher: t.id_professor,
      name: t.nom,
      contact: t.contacte,
      id_center: t.id_center,
      user: t.user ? {
        id_user: t.user.id_user,
        email: t.user.email,
        nom_complet: t.user.nom_complet,
        url_foto: t.user.url_foto
      } : undefined
    }));
  },
  getByCenter: async (idCenter: number): Promise<Teacher[]> => {
    const api = getApi();
    const response = await api.get<BackendTeacher[]>(`/teachers/centre/${idCenter}`);
    return response.data.map((t: BackendTeacher) => ({
      id_teacher: t.id_professor,
      name: t.nom,
      contact: t.contacte,
      id_center: t.id_center,
      user: t.user ? {
        id_user: t.user.id_user,
        email: t.user.email,
        nom_complet: t.user.nom_complet,
        url_foto: t.user.url_foto
      } : undefined
    }));
  },
  create: async (data: Omit<Teacher, 'id_teacher'>): Promise<Teacher> => {
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
