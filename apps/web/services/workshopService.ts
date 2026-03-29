import getApi from "./api";

export interface Workshop {
  _id: string;
  title: string;
  sector: string;
  sectorId?: number;
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
  workshopId: number;
  title: string;
  modality: string;
  icon?: string;
  description?: string;
  durationHours?: number;
  maxPlaces?: number;
  executionDays?: { dayOfWeek: number; startTime: string; endTime: string }[];
  sector?: { name: string };
  sectorId?: number;
  location?: string;
  imageUrl?: string;
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
        _id: t.workshopId.toString(),
        title: t.title,
        sector: t.sector?.name || "General",
        sectorId: t.sectorId,
        modality: t.modality,
        term: "1st",
        // Map emoji to ID if necessary, or use the string ID directly
        icon: t.icon === "🧩" ? "PUZZLE" : (t.icon || "PUZZLE"),
        technicalDetails: {
          description: t.description || "",
          durationHours: t.durationHours || 0,
          maxPlaces: t.maxPlaces || 0,
          defaultLocation: t.location || "To be defined",
        },
        assignedReferents: [],
        executionDays: t.executionDays || [],
        image: t.imageUrl || "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=800&auto=format&fit=crop",
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
        title: workshopData.title,
        description: workshopData.technicalDetails?.description,
        durationHours: workshopData.technicalDetails?.durationHours,
        maxPlaces: workshopData.technicalDetails?.maxPlaces,
        modality: workshopData.modality,
        icon: workshopData.icon,
        sectorId: workshopData.sectorId || 1,
        executionDays: workshopData.executionDays,
      };

      const response = await api.post("/workshops", payload);
      const t = response.data;

      return {
        _id: t.workshopId.toString(),
        title: t.title,
        sector: t.sector?.name || "General",
        sectorId: t.sectorId,
        modality: t.modality,
        icon: t.icon || "PUZZLE",
        term: "1st",
        technicalDetails: {
          description: t.description || "",
          durationHours: t.durationHours || 0,
          maxPlaces: t.maxPlaces || 0,
          defaultLocation: t.location || "To be defined",
        },
        assignedReferents: [],
        executionDays: t.executionDays || [],
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
      if (workshopData.title) payload.title = workshopData.title;
      if (workshopData.modality) payload.modality = workshopData.modality;
      if (workshopData.sectorId) payload.sectorId = workshopData.sectorId;
      if (workshopData.icon) payload.icon = workshopData.icon;
      if (workshopData.executionDays) payload.executionDays = workshopData.executionDays;
      if (workshopData.technicalDetails) {
        if (workshopData.technicalDetails.description) payload.description = workshopData.technicalDetails.description;
        if (workshopData.technicalDetails.durationHours) payload.durationHours = workshopData.technicalDetails.durationHours;
        if (workshopData.technicalDetails.maxPlaces) payload.maxPlaces = workshopData.technicalDetails.maxPlaces;
      }

      const response = await api.put(`/workshops/${id}`, payload);
      const t = response.data;

      return {
        _id: t.workshopId.toString(),
        title: t.title,
        sector: t.sector?.name || "General",
        sectorId: t.sectorId,
        modality: t.modality,
        term: "1st",
        icon: t.icon || "PUZZLE",
        technicalDetails: {
          description: t.description || "",
          durationHours: t.durationHours || 0,
          maxPlaces: t.maxPlaces || 0,
          defaultLocation: t.location || "To be defined",
        },
        assignedReferents: [],
        executionDays: t.executionDays || [],
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
      console.error("Error in workshopService.delete:", error);
      const errorMessage = (error as { response?: { data?: { error?: string } } }).response?.data?.error || "Could not delete workshop";
      throw new Error(errorMessage);
    }
  },
};

export default workshopService;
