import getApi from "./api";

export interface Request {
  id_request: number;
  id_center: number;
  id_workshop: number;
  approxStudents: number | null;
  comments: string | null;
  requestDate: string;
  status: string;
  modality?: string;
  teacher1Id?: number;
  teacher2Id?: number;
  studentIds?: number[];
  workshop?: {
    title: string;
    sector: string;
    modality: string;
  };
  center?: {
    name: string;
  };
  teacher1?: { name: string };
  teacher2?: { name: string };
}

interface BackendRequest {
  id_request: number;
  id_center: number;
  id_workshop: number;
  alumnes_aprox: number | null;
  comentaris: string | null;
  data_request: string;
  estat: string;
  modalitat: string;
  prof1_id?: number;
  prof2_id?: number;
  ids_alumnes?: number[];
  workshop?: {
    titol: string;
    sector?: { nom: string };
    modalitat: string;
  };
  center?: {
    nom: string;
  };
  prof1?: { nom: string };
  prof2?: { nom: string };
}

const requestService = {
  /**
   * Gets all requests.
   */
  getAll: async (): Promise<Request[]> => {
    const api = getApi();
    try {
      const response = await api.get<{ data: BackendRequest[], meta: unknown }>("/requests?limit=0");
      return response.data.data.map((r: BackendRequest) => ({
        id_request: r.id_request,
        id_center: r.id_center,
        id_workshop: r.id_workshop,
        approxStudents: r.alumnes_aprox,
        comments: r.comentaris,
        requestDate: r.data_request,
        status: r.estat,
        modality: r.modalitat,
        teacher1Id: r.prof1_id,
        teacher2Id: r.prof2_id,
        studentIds: r.ids_alumnes,
        workshop: r.workshop ? {
          title: r.workshop.titol,
          sector: r.workshop.sector?.nom || "General",
          modality: r.workshop.modalitat,
        } : undefined,
        center: r.center ? {
          name: r.center.nom,
        } : undefined,
        teacher1: r.prof1 ? { name: r.prof1.nom } : undefined,
        teacher2: r.prof2 ? { name: r.prof2.nom } : undefined,
      }));
    } catch (error) {
      console.error("Error in requestService.getAll:", error);
      throw error;
    }
  },

  /**
   * Creates a new request.
   */
  create: async (data: {
    id_workshop: number;
    approxStudents: number;
    comments?: string;
    teacher1Id?: number;
    teacher2Id?: number;
    modality?: string;
  }): Promise<Request> => {
    const api = getApi();
    try {
      const payload = {
        id_workshop: data.id_workshop,
        alumnes_aprox: data.approxStudents,
        comentaris: data.comments,
        prof1_id: data.teacher1Id,
        prof2_id: data.teacher2Id,
        modalitat: data.modality,
      };
      const response = await api.post<BackendRequest>("/requests", payload);
      const r = response.data;
      return {
        id_request: r.id_request,
        id_center: r.id_center,
        id_workshop: r.id_workshop,
        approxStudents: r.alumnes_aprox,
        comments: r.comentaris,
        requestDate: r.data_request,
        status: r.estat,
        modality: r.modalitat,
        teacher1Id: r.prof1_id,
        teacher2Id: r.prof2_id,
        studentIds: r.ids_alumnes,
      };
    } catch (error) {
      console.error("Error in requestService.create:", error);
      const errorMessage = (error as { response?: { data?: { error?: string } } }).response?.data?.error || "Failed to create request";
      throw new Error(errorMessage);
    }
  },

  /**
   * Updates an existing request.
   */
  update: async (id: number, data: {
    approxStudents?: number;
    comments?: string;
    teacher1Id?: number;
    teacher2Id?: number;
  }): Promise<Request> => {
    const api = getApi();
    try {
      const payload = {
        alumnes_aprox: data.approxStudents,
        comentaris: data.comments,
        prof1_id: data.teacher1Id,
        prof2_id: data.teacher2Id,
      };
      const response = await api.put<BackendRequest>(`/requests/${id}`, payload);
      const r = response.data;
      return {
        id_request: r.id_request,
        id_center: r.id_center,
        id_workshop: r.id_workshop,
        approxStudents: r.alumnes_aprox,
        comments: r.comentaris,
        requestDate: r.data_request,
        status: r.estat,
        modality: r.modalitat,
        teacher1Id: r.prof1_id,
        teacher2Id: r.prof2_id,
        studentIds: r.ids_alumnes,
      };
    } catch (error) {
      console.error("Error in requestService.update:", error);
      const errorMessage = (error as { response?: { data?: { error?: string } } }).response?.data?.error || "Could not update the request";
      throw new Error(errorMessage);
    }
  },

  /**
   * Updates the status of a request.
   */
  updateStatus: async (id: number, status: string): Promise<Request> => {
    const api = getApi();
    try {
      const response = await api.patch<BackendRequest>(`/requests/${id}/status`, { estat: status });
      const r = response.data;
      return {
        id_request: r.id_request,
        id_center: r.id_center,
        id_workshop: r.id_workshop,
        approxStudents: r.alumnes_aprox,
        comments: r.comentaris,
        requestDate: r.data_request,
        status: r.estat,
        modality: r.modalitat,
        teacher1Id: r.prof1_id,
        teacher2Id: r.prof2_id,
        studentIds: r.ids_alumnes,
      };
    } catch (error) {
      console.error("Error in requestService.updateStatus:", error);
      throw error;
    }
  }
};

export default requestService;
