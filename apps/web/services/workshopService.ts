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
  image?: string;
}

interface BackendWorkshop {
  id_workshop: number;
  titol: string;
  modalitat: string;
  icona?: string;
  descripcio?: string;
  durada_h?: number;
  places_maximes?: number;
  dies_execucio?: { dayOfWeek: number; startTime: string; endTime: string }[];
  sector?: { nom: string };
  id_sector?: number;
}

const workshopService = {
  /**
   * Gets all workshops from the backend.
   */
  getAll: async (): Promise<Workshop[]> => {
    const api = getApi();
    try {
      const response = await api.get<{ data: BackendWorkshop[], meta: unknown }>("/workshops?limit=0");
      const workshopsData = response.data.data;

      return workshopsData.map((t: BackendWorkshop) => ({
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
        image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=800&auto=format&fit=crop",
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
    } catch (error) {
      console.error("Error in workshopService.create:", error);
      const errorMessage = (error as { response?: { data?: { error?: string } } }).response?.data?.error || "Could not create workshop";
      throw new Error(errorMessage);
    }
  },

  update: async (id: string, workshopData: Partial<Workshop>): Promise<Workshop> => {
    const api = getApi();
    try {
      const payload: Record<string, unknown> = {};
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
    } catch (error) {
      console.error("Error in workshopService.update:", error);
      const errorMessage = (error as { response?: { data?: { error?: string } } }).response?.data?.error || "Could not update workshop";
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
    } catch (error) {
      console.error("Error in workshopService.getAll:", error);
      const errorMessage = (error as { response?: { data?: { error?: string } } }).response?.data?.error || "Could not fetch workshops";
      throw new Error(errorMessage);
    }
  },
};

export default workshopService;