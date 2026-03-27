import getApi from './api';

export interface Notification {
  notificationId: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type: 'REQUEST' | 'PHASE' | 'SYSTEM';
  importance: 'INFO' | 'WARNING' | 'URGENT';
}

const notificationService = {
  getAll: async (): Promise<Notification[]> => {
    const api = getApi();
    const response = await api.get('/notifications');
    return response.data;
  },

  markAsRead: async (notificationId: number): Promise<Notification> => {
    const api = getApi();
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },

  delete: async (notificationId: number): Promise<void> => {
    const api = getApi();
    await api.delete(`/notifications/${notificationId}`);
  }
};

export default notificationService;
