import getApi from "./api";

export interface Center {
  id_center: number;
  codi_center: string;
  nom: string;
  adreca?: string;
  telefon_contacte?: string;
  email_contacte?: string;
}

const centerService = {
  /**
   * Obtiene todos los centros desde el backend.
   */
  getAll: async (): Promise<Center[]> => {
    const api = getApi();
    try {
      const response = await api.get<{ data: Center[], meta: unknown }>("/centers");
      return response.data.data;
    } catch (error) {
      console.error("Error en centerService.getAll:", error);
      throw error;
    }
  },

  /**
   * Crea un nuevo centro en el backend.
   */
  create: async (centroData: Omit<Center, 'id_center'>): Promise<Center> => {
    const api = getApi();
    try {
      const response = await api.post("/centers", centroData);
      return response.data;
    } catch (error) {
      console.error("Error en centerService.create:", error);
      const errorMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message || "No se pudo crear el centro";
      throw new Error(errorMessage);
    }
  },

  /**
   * Actualiza un centro existente.
   */
  update: async (id: number, centroData: Partial<Center>): Promise<Center> => {
    const api = getApi();
    try {
      // The backend controller only has updateCenterAttendance for PATCH.
      // But usually we need more. Let's look at the controller again.
      // It only has getCenters, getCenterById, createCenter, updateCenterAttendance.
      // I'll implement what's available and assume more might be needed or added.
      const response = await api.patch(`/centers/${id}`, centroData);
      return response.data;
    } catch (error) {
      console.error("Error en centerService.update:", error);
      const errorMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message || "No se pudo actualizar el centro";
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
    } catch (error) {
      console.error("Error en centerService.delete:", error);
      const errorMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message || "No se pudo eliminar el centro";
      throw new Error(errorMessage);
    }
  },
};

export default centerService;
