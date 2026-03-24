import getApi from "./api";

export interface Workshop {
  _id: string;
  title: string;
  sector: string;
  id_sector?: number;
  modality: string;
  term: string;
  icon?: string;
  technicalDetails?: {
    description: string;
    durationHours: number;
    maxPlaces: number;
    defaultLocation: string;
  };
  assignedReferents?: string[];
  executionDays: { dayOfWeek: number; startTime: string; endTime: string }[];
}

const workshopService = {
  /**
   * Gets all workshops from the backend.
   */
  getAll: async (): Promise<Workshop[]> => {
    const api = getApi();
    try {
      const response = await api.get<{ data: any[], meta: any }>("/workshops?limit=0");
      const workshopsData = response.data.data;

      return workshopsData.map((t: any) => ({
        _id: t.id_workshop.toString(),
        title: t.titol,
        sector: t.sector?.nom || "General",
        id_sector: t.id_sector,
        modality: t.modalitat,
        term: "1st",
        icon: t.icona || "🧩",
        technicalDetails: {
          description: t.descripcio || "",
          durationHours: t.durada_h || 0,
          maxPlaces: t.places_maximes || 0,
          defaultLocation: "Ca n'Olivella",
        },
        assignedReferents: [],
        executionDays: t.dies_execucio || [],
      }));
    } catch (error) {
      console.error("Error in workshopService.getAll:", error);
      throw error;
    }
  },

  create: async (workshopData: Omit<Workshop, '_id'>): Promise<Workshop> => {
    const api = getApi();
    try {
      const payload = {
        titol: workshopData.title,
        descripcio: workshopData.technicalDetails?.description,
        durada_h: workshopData.technicalDetails?.durationHours,
        places_maximes: workshopData.technicalDetails?.maxPlaces,
        modalitat: workshopData.modality,
        icona: workshopData.icon,
        id_sector: workshopData.id_sector || 1,
        dies_execucio: workshopData.executionDays,
      };

      const response = await api.post("/workshops", payload);
      const t = response.data;

      return {
        _id: t.id_workshop.toString(),
        title: t.titol,
        sector: t.sector?.nom || "General",
        id_sector: t.id_sector,
        modality: t.modalitat,
        icon: t.icona || "🧩",
        term: "1st",
        technicalDetails: {
          description: t.descripcio || "",
          durationHours: t.durada_h || 0,
          maxPlaces: t.places_maximes || 0,
          defaultLocation: "Ca n'Olivella",
        },
        assignedReferents: [],
        executionDays: t.dies_execucio || [],
      };
    } catch (error: any) {
      console.error("Error in workshopService.create:", error);
      const errorMessage = error.response?.data?.message || "Could not create the workshop";
      throw new Error(errorMessage);
    }
  },

  update: async (id: string, workshopData: Partial<Workshop>): Promise<Workshop> => {
    const api = getApi();
    try {
      const payload: any = {};
      if (workshopData.title) payload.titol = workshopData.title;
      if (workshopData.modality) payload.modalitat = workshopData.modality;
      if (workshopData.id_sector) payload.id_sector = workshopData.id_sector;
      if (workshopData.icon) payload.icona = workshopData.icon;
      if (workshopData.executionDays) payload.dies_execucio = workshopData.executionDays;
      if (workshopData.technicalDetails) {
        if (workshopData.technicalDetails.description) payload.descripcio = workshopData.technicalDetails.description;
        if (workshopData.technicalDetails.durationHours) payload.durada_h = workshopData.technicalDetails.durationHours;
        if (workshopData.technicalDetails.maxPlaces) payload.places_maximes = workshopData.technicalDetails.maxPlaces;
      }

      const response = await api.put(`/workshops/${id}`, payload);
      const t = response.data;

      return {
        _id: t.id_workshop.toString(),
        title: t.titol,
        sector: t.sector?.nom || "General",
        id_sector: t.id_sector,
        modality: t.modalitat,
        term: "1st",
        icon: t.icona || "🧩",
        technicalDetails: {
          description: t.descripcio || "",
          durationHours: t.durada_h || 0,
          maxPlaces: t.places_maximes || 0,
          defaultLocation: "Ca n'Olivella",
        },
        assignedReferents: [],
        executionDays: t.dies_execucio || [],
      };
    } catch (error: any) {
      console.error("Error in workshopService.update:", error);
      const errorMessage = error.response?.data?.message || "Could not update the workshop";
      throw new Error(errorMessage);
    }
  },

  /**
   * Deletes an existing workshop.
   */
  delete: async (id: string): Promise<void> => {
    const api = getApi();
    try {
      await api.delete(`/workshops/${id}`);
    } catch (error: any) {
      console.error("Error in workshopService.delete:", error);
      const errorMessage = error.response?.data?.message || "Could not delete the workshop";
      throw new Error(errorMessage);
    }
  },
};

export default workshopService;