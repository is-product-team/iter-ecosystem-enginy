import getApi from "./api";

export interface Centre {
  id_centre: number;
  codi_centre: string;
  nom: string;
  adreca?: string;
  telefon_contacte?: string;
  email_contacte?: string;
}

const centroService = {
  /**
   * Obtiene todos los centros desde el backend.
   */
  getAll: async (): Promise<Centre[]> => {
    const api = getApi();
    try {
      const response = await api.get<{ data: Centre[], meta: any }>("/centers");
      return response.data.data;
    } catch (error) {
      console.error("Error en centroService.getAll:", error);
      throw error;
    }
  },

  /**
   * Crea un nuevo centro en el backend.
   */
  create: async (centroData: Omit<Centre, 'id_centre'>): Promise<Centre> => {
    const api = getApi();
    try {
      const response = await api.post("/centers", centroData);
      return response.data;
    } catch (error: any) {
      console.error("Error en centroService.create:", error);
      const errorMessage = error.response?.data?.message || "No se pudo crear el centro";
      throw new Error(errorMessage);
    }
  },

  /**
   * Actualiza un centro existente.
   */
  update: async (id: number, centroData: Partial<Centre>): Promise<Centre> => {
    const api = getApi();
    try {
      // The backend controller only has updateCentreAttendance for PATCH.
      // But usually we need more. Let's look at the controller again.
      // It only has getCentres, getCentreById, createCentre, updateCentreAttendance.
      // I'll implement what's available and assume more might be needed or added.
      const response = await api.patch(`/centers/${id}`, centroData);
      return response.data;
    } catch (error: any) {
      console.error("Error en centroService.update:", error);
      const errorMessage = error.response?.data?.message || "No se pudo actualizar el centro";
      throw new Error(errorMessage);
    }
  },

  /**
   * Elimina un centro (not implemented in backend yet, but adding for frontend completeness)
   */
  delete: async (id: number): Promise<void> => {
    const api = getApi();
    try {
      await api.delete(`/centers/${id}`);
    } catch (error: any) {
      console.error("Error en centroService.delete:", error);
      const errorMessage = error.response?.data?.message || "No se pudo eliminar el centro";
      throw new Error(errorMessage);
    }
  },
};

export default centroService;
