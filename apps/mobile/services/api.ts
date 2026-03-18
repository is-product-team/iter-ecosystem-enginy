import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { router } from 'expo-router';
import type { 
  Rol, 
  Fase, 
  Notificacio, 
  Assistencia,
  Inscripcio,
  Alumne,
  Assignacio
} from '@iter/shared';

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
  api.post<{ token: string; user: { userId: number; role: Rol; centreId?: number } }>('auth/login', data);

// --- Assignments & Professors ---
export const getMyAssignments = () => 
  api.get<Assignacio[]>('teachers/me/assignments');

export const getChecklist = (id: string | number) => 
  api.get(`assignments/${id}/checklist`);

export const getStudents = (id: string | number) => 
  api.get<(Inscripcio & { alumne: Alumne })[]>(`assignments/${id}/students`);

// --- Attendance ---
export const getAttendance = (idAssignment: string | number) => 
  api.get<Assistencia[]>(`attendance/assignments/${idAssignment}`);

export const postAttendance = (data: { 
  id_inscripcio: number; 
  numero_sessio: number; 
  estat: string; 
  observacions?: string;
  data_sessio?: string;
}) => api.post<Assistencia>('attendance', data);

// --- Other Services ---
export const postIncidencia = (data: { id_assignacio: number; titol: string; descripcio: string }) => 
  api.post('assignments/incidencies', data);

export const getPhases = () => 
  api.get<Fase[]>('phases');

export const getCalendar = () => 
  api.get('calendar');

export const getNotifications = () => 
  api.get<Notificacio[]>('notifications');

export default api;
