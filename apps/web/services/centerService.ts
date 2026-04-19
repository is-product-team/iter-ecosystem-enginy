import getApi from "./api";

export interface Center {
  centerId: number;
  centerCode: string;
  name: string;
  address?: string;
  photoUrl?: string;
  contactPhone?: string;
  contactEmail?: string;
}

const centerService = {
  /**
   * Gets all centers from the backend.
   */
  getAll: async (): Promise<Center[]> => {
    const api = getApi();
    try {
      const response = await api.get<{ data: any[], meta: unknown }>("/centers");
      return response.data.data.map((c: any) => ({
        centerId: c.centerId,
        centerCode: c.centerCode,
        name: c.name,
        address: c.address,
        photoUrl: c.photoUrl,
        contactPhone: c.contactPhone,
        contactEmail: c.contactEmail
      }));
    } catch (error) {
      console.error("Error in centerService.getAll:", error);
      throw error;
    }
  },

  /**
   * Creates a new center in the backend.
   */
  create: async (centerData: Omit<Center, 'centerId'>): Promise<Center> => {
    const api = getApi();
    try {
      const response = await api.post("/centers", centerData);
      return response.data;
    } catch (error) {
      console.error("Error in centerService.create:", error);
      const errorMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Could not create center";
      throw new Error(errorMessage);
    }
  },

  /**
   * Updates an existing center.
   */
  update: async (id: number, centerData: Partial<Center>): Promise<Center> => {
    const api = getApi();
    try {
      const response = await api.patch(`/centers/${id}`, centerData);
      return response.data;
    } catch (error) {
      console.error("Error in centerService.update:", error);
      const errorMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Could not update center";
      throw new Error(errorMessage);
    }
  },

  /**
   * Deletes a center.
   */
  delete: async (id: number): Promise<void> => {
    const api = getApi();
    try {
      await api.delete(`/centers/${id}`);
    } catch (error) {
      console.error("Error in centerService.delete:", error);
      const errorMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Could not delete center";
      throw new Error(errorMessage);
    }
  },
};

export default centerService;
