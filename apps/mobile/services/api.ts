import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { router } from 'expo-router';
import type { 
  Role, 
  Phase, 
  Student as SharedStudent
} from '@iter/shared';

export interface Student {
  id_student: number;
  idalu: string;
  fullName: string;
  surnames: string;
  grade?: string;
  photoUrl?: string;
}

export interface Workshop {
  id_workshop: number;
  title: string;
  description: string;
  durationHours: number;
  maxPlaces: number;
  icon: string;
}

export interface Center {
  id_center: number;
  name: string;
  address?: string;
}

export interface Enrollment {
  id_enrollment: number;
  id_assignment: number;
  id_student: number;
  student: Student;
  [key: string]: any;
}

export interface Assignment {
  id_assignment: number;
  id_request?: number;
  id_center: number;
  center: Center;
  id_workshop: number;
  workshop: Workshop;
  startDate: string; // Changed from data_inici
  endDate: string;
  status: string;
  group: number;
  sessions?: Session[];
  [key: string]: any;
}

export interface Session {
  id_session: number;
  id_assignment: number;
  sessionDate: string; // Changed from data_session
  startTime: string;   // Changed from hora_inici
  endTime: string;     // Changed from hora_fi
}

export interface Attendance {
  id_attendance: number;
  id_enrollment: number;
  sessionNumber: number; // Changed from numero_sessio
  status: string;        // Changed from estat
  comments?: string;     // Changed from observacions
  sessionDate: string;   // Changed from data_session
  [key: string]: any;
}

export interface Notification {
  id_notification: number;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  type: string;
  importance: string;
}

const getBaseURL = () => {
  let url = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }
  return url.endsWith('/api') ? url : `${url}/api`;
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
    console.error('Error al cerrar sesión:', error);
  }
};

// --- Auth ---
export const login = (data: { email: string; password?: string }) => 
  api.post<{ token: string; user: { userId: number; role: Role; centreId?: number } }>('auth/login', data);

// --- Assignments & Teachers ---
export const getMyAssignments = () => 
  api.get<Assignment[]>('teachers/me/assignments');

export const getChecklist = (id: string | number) => 
  api.get(`assignments/${id}/checklist`);

export const getStudents = (id: string | number) => 
  api.get<(Enrollment & { alumne: Student })[]>(`assignments/${id}/students`);

// --- Attendance ---
export const getAttendance = (idAssignment: string | number) => 
  api.get<Attendance[]>(`attendance/assignments/${idAssignment}`);

export const postAttendance = (data: { 
  id_enrollment: number; 
  sessionNumber: number; // Changed from numero_sessio
  status: string;        // Changed from estat
  comments?: string;     // Changed from observacions
  sessionDate?: string;
}) => api.post<Attendance>('attendance', data);

// --- Other Services ---
export const postIncidencia = (data: { id_assignment: number; titol: string; descripcio: string }) => 
  api.post('assignments/incidencies', data);

export const getPhases = () => 
  api.get<Phase[]>('phases');

export const getCalendar = () => 
  api.get('calendar');

export const getNotifications = () => 
  api.get<Notification[]>('notifications');

export default api;
