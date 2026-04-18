import api from './api';
import { IssueInput, IssueMessageInput } from '@iter/shared';

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
  _count?: { messages: number };
}

const issueService = {
  getAll: async (): Promise<Issue[]> => {
    const response = await api.get('issues');
    return response.data;
  },

  getById: async (id: number): Promise<Issue> => {
    const response = await api.get(`issues/${id}`);
    return response.data;
  },

  create: async (data: IssueInput): Promise<Issue> => {
    const response = await api.post('issues', data);
    return response.data;
  },

  addMessage: async (issueId: number, content: string): Promise<any> => {
    const response = await api.post(`issues/${issueId}/messages`, { content, isSystem: false });
    return response.data;
  },
};

export default issueService;
