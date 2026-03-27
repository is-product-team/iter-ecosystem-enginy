import getApi from "./api";

export interface StatusStat {
  status: string;
  total: number;
  lastUpdate: string;
}

export interface PopularStat {
  _id: string; // Workshop title
  totalRequests: number;
  totalStudents: number;
}

export interface ActivityLog {
  logId: number;
  actionType: string;
  userId?: number;
  timestamp: string;
  description: string;
  user?: {
    fullName: string;
    email: string;
  };
}

const statsService = {
  getByStatus: async (): Promise<StatusStat[]> => {
    const api = getApi();
    const response = await api.get<StatusStat[]>("/stats/status");
    return response.data;
  },
  getPopular: async (): Promise<PopularStat[]> => {
    const api = getApi();
    const response = await api.get<PopularStat[]>("/stats/popular");
    return response.data;
  },
  getActivity: async (): Promise<ActivityLog[]> => {
    const api = getApi();
    const response = await api.get<ActivityLog[]>("/stats/activity");
    return response.data;
  },
  cleanupLogs: async (): Promise<{ success: boolean; deletedCount: number; message: string }> => {
    const api = getApi();
    const response = await api.delete<{ success: boolean; deletedCount: number; message: string }>("/stats/logs/cleanup");
    return response.data;
  }
};

export default statsService;
