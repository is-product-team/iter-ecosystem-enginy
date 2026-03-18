import getApi from "./api";

export interface Peticio {
  id_peticio: number;
  id_centre: number;
  id_taller: number;
  alumnes_aprox: number | null;
  comentaris: string | null;
  data_peticio: string;
  estat: string;
  modalitat?: string;
  prof1_id?: number;
  prof2_id?: number;
  ids_alumnes?: number[];
  taller?: {
    titol: string;
    sector: string; // Added sector as it might be useful
    modalitat: string; // Added modalitat
  };
  centre?: {
    nom: string;
  };
}

const peticioService = {
  /**
   * Obtiene las peticiones.
   */
  getAll: async (): Promise<Peticio[]> => {
    const api = getApi();
    try {
      const response = await api.get<{ data: Peticio[], meta: any }>("/requests?limit=0");
      return response.data.data;
    } catch (error) {
      console.error("Error en peticioService.getAll:", error);
      throw error;
    }
  },

  /**
   * Crea una nueva petición.
   */
  create: async (data: {
    id_taller: number;
    alumnes_aprox: number;
    comentaris?: string;
    prof1_id?: number;
    prof2_id?: number;
    modalitat?: string;
  }): Promise<Peticio> => {
    const api = getApi();
    try {
      const response = await api.post<Peticio>("/requests", data);
      return response.data;
    } catch (error: any) {
      console.error("Error en peticioService.create:", error);
      const errorMessage = error.response?.data?.error || "No se pudo crear la solicitud";
      throw new Error(errorMessage);
    }
  },

  /**
   * Actualiza una petición existente.
   */
  update: async (id: number, data: {
    alumnes_aprox?: number;
    comentaris?: string;
    prof1_id?: number;
    prof2_id?: number;
  }): Promise<Peticio> => {
    const api = getApi();
    try {
      const response = await api.put<Peticio>(`/requests/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error("Error en peticioService.update:", error);
      const errorMessage = error.response?.data?.error || "No se pudo actualizar la solicitud";
      throw new Error(errorMessage);
    }
  },

  /**
   * Actualiza el estado de una petición.
   */
  updateStatus: async (id: number, estat: string): Promise<Peticio> => {
    const api = getApi();
    try {
      const response = await api.patch<Peticio>(`/requests/${id}/status`, { estat });
      return response.data;
    } catch (error) {
      console.error("Error en peticioService.updateStatus:", error);
      throw error;
    }
  }
};

export default peticioService;
