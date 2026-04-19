import getApi from './api';
import { IssueInput, IssueMessageInput } from '@iter/shared';

export interface Attachment {
  attachmentId: number;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
}

export interface IssueMessage {
  messageId: number;
  issueId: number;
  content: string;
  isSystem: boolean;
  createdAt: string;
  senderId: number | null;
  sender?: {
    fullName: string;
    role: { roleName: string };
  };
  attachments?: Attachment[];
}

export interface Issue {
  issueId: number;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category: string;
  centerId: number;
  creatorId: number;
  createdAt: string;
  resolvedAt?: string;
  center?: { name: string };
  creator?: { fullName: string; role?: any };
  messages?: IssueMessage[];
  attachments?: Attachment[];
  _count?: { messages: number };
}

const issueService = {
  getAll: async (): Promise<Issue[]> => {
    const api = getApi();
    const response = await api.get('/issues');
    return response.data;
  },

  getById: async (id: number): Promise<Issue> => {
    const api = getApi();
    const response = await api.get(`/issues/${id}`);
    return response.data;
  },

  create: async (data: IssueInput): Promise<Issue> => {
    const api = getApi();
    const response = await api.post('/issues', data);
    return response.data;
  },

  addMessage: async (issueId: number, data: Partial<IssueMessageInput>): Promise<IssueMessage> => {
    const api = getApi();
    const response = await api.post(`/issues/${issueId}/messages`, data);
    return response.data;
  },

  updateStatus: async (id: number, status: string): Promise<Issue> => {
    const api = getApi();
    const response = await api.patch(`/issues/${id}/status`, { status });
    return response.data;
  },

  updatePriority: async (id: number, priority: string): Promise<Issue> => {
    const api = getApi();
    const response = await api.patch(`/issues/${id}/priority`, { priority });
    return response.data;
  }
};

export default issueService;
