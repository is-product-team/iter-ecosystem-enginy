import getApi from "./api";

export interface Request {
  id_request: number;
  centerId: number;
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
  approxStudents: number | null;
  comments: string | null;
  requestDate: string;
  status: string;
  modality: string;
  teacher1Id?: number;
  teacher2Id?: number;
  studentIds?: number[];
  workshop?: {
    title: string;
    sector?: { name: string };
    modality: string;
  };
  center?: {
    name: string;
  };
  teacher1?: { name: string };
  teacher2?: { name: string };
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
        centerId: r.id_center,
        id_workshop: r.id_workshop,
        approxStudents: r.approxStudents,
        comments: r.comments,
        requestDate: r.requestDate,
        status: r.status,
        modality: r.modality,
        teacher1Id: r.teacher1Id,
        teacher2Id: r.teacher2Id,
        studentIds: r.studentIds,
        workshop: r.workshop ? {
          title: r.workshop.title,
          sector: r.workshop.sector?.name || "General",
          modality: r.workshop.modality,
        } : undefined,
        center: r.center ? {
          name: r.center.name,
        } : undefined,
        teacher1: r.teacher1 ? { name: r.teacher1.name } : undefined,
        teacher2: r.teacher2 ? { name: r.teacher2.name } : undefined,
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
        approxStudents: data.approxStudents,
        comments: data.comments,
        teacher1Id: data.teacher1Id,
        teacher2Id: data.teacher2Id,
        modality: data.modality,
      };
      const response = await api.post<BackendRequest>("/requests", payload);
      const r = response.data;
      return {
        id_request: r.id_request,
        centerId: r.id_center,
        id_workshop: r.id_workshop,
        approxStudents: r.approxStudents,
        comments: r.comments,
        requestDate: r.requestDate,
        status: r.status,
        modality: r.modality,
        teacher1Id: r.teacher1Id,
        teacher2Id: r.teacher2Id,
        studentIds: r.studentIds,
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
        approxStudents: data.approxStudents,
        comments: data.comments,
        teacher1Id: data.teacher1Id,
        teacher2Id: data.teacher2Id,
      };
      const response = await api.put<BackendRequest>(`/requests/${id}`, payload);
      const r = response.data;
      return {
        id_request: r.id_request,
        centerId: r.id_center,
        id_workshop: r.id_workshop,
        approxStudents: r.approxStudents,
        comments: r.comments,
        requestDate: r.requestDate,
        status: r.status,
        modality: r.modality,
        teacher1Id: r.teacher1Id,
        teacher2Id: r.teacher2Id,
        studentIds: r.studentIds,
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
      const response = await api.patch<BackendRequest>(`/requests/${id}/status`, { status });
      const r = response.data;
      return {
        id_request: r.id_request,
        centerId: r.id_center,
        id_workshop: r.id_workshop,
        approxStudents: r.approxStudents,
        comments: r.comments,
        requestDate: r.requestDate,
        status: r.status,
        modality: r.modality,
        teacher1Id: r.teacher1Id,
        teacher2Id: r.teacher2Id,
        studentIds: r.studentIds,
      };
    } catch (error) {
      console.error("Error in requestService.updateStatus:", error);
      throw error;
    }
  }
};

export default requestService;
