import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { router } from 'expo-router';
import type { 
  Role, 
  Phase, 
} from '@iter/shared';

export interface Student {
  studentId: number;
  idalu: string;
  fullName: string;
  lastName: string;
  grade?: string;
  photoUrl?: string;
}

export interface Workshop {
  workshopId: number;
  title: string;
  description: string;
  durationHours: number;
  maxPlaces: number;
  icon: string;
}

export interface Center {
  centerId: number;
  name: string;
  address?: string;
}

export interface Enrollment {
  enrollmentId: number;
  assignmentId: number;
  studentId: number;
  student: Student;
  [key: string]: any;
}

export interface Assignment {
  assignmentId: number;
  requestId?: number;
  centerId: number;
  center: Center;
  workshopId: number;
  workshop: Workshop;
  startDate: string;
  endDate: string;
  status: string;
  group: number;
  sessions?: Session[];
  [key: string]: any;
}

export interface Session {
  sessionId: number;
  assignmentId: number;
  sessionDate: string;
  startTime: string;
  endTime: string;
}

export interface Attendance {
  attendanceId: number;
  enrollmentId: number;
  sessionNumber: number;
  status: string;
  observations?: string;
  sessionDate: string;
  [key: string]: any;
}

export interface Notification {
  notificationId: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type: string;
  importance: string;
}

const getBaseURL = () => {
  let url = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }
  return url;
};

const api = axios.create({
  baseURL: getBaseURL().endsWith('/') ? getBaseURL() : `${getBaseURL()}/`,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

api.interceptors.request.use(
  async (config) => {
    try {
      let token = null;
      if (Platform.OS === 'web') {
        token = localStorage.getItem('token');
      } else {
        token = await SecureStore.getItemAsync('token');
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // @ts-ignore
      config.metadata = { startTime: new Date() };
    } catch (error) {
      console.warn('⚠️ [API] Token read error:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await logout();
      setTimeout(() => {
        router.replace('/login');
      }, 100);
    }
    return Promise.reject(error);
  }
);

export const logout = async () => {
  try {
    if (Platform.OS === 'web') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } else {
      await SecureStore.deleteItemAsync('token');
      await SecureStore.deleteItemAsync('user');
    }
  } catch (error) {
    console.error('Error closing session:', error);
  }
};

// --- Auth ---
export const login = (data: { email: string; password?: string }) => 
  api.post<{ token: string; user: { userId: number; role: Role; centerId?: number } }>('auth/login', data);

// --- Assignments & Teachers ---
export const getMyAssignments = () => 
  api.get<Assignment[]>('teachers/me/assignments');

export const getChecklist = (id: string | number) => 
  api.get(`assignments/${id}/checklist`);

export const getStudents = (id: string | number) => 
  api.get<Enrollment[]>(`assignments/${id}/students`);

// --- Attendance ---
export const getAttendance = (assignmentId: string | number) => 
  api.get<Attendance[]>(`attendance/assignments/${assignmentId}`);

export const postAttendance = (data: { 
  enrollmentId: number; 
  sessionNumber: number;
  status: string;
  observations?: string;
  sessionDate?: string;
}) => api.post<Attendance>('attendance', data);

// --- Other Services ---
export const postIncident = (data: { assignmentId: number; title: string; description: string }) => 
  api.post('assignments/incidents', data);

export const getPhases = () => 
  api.get<Phase[]>('phases');

export const getCalendar = () => 
  api.get('calendar');

export const getNotifications = () => 
  api.get<Notification[]>('notifications');

export default api;
