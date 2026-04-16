import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { router } from 'expo-router';
import * as ExpoConstants from 'expo-constants';

// For backward compatibility or different export styles
const Constants = ExpoConstants.default || ExpoConstants;
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

// --- MOCKS FOR LAURA (PROFESSIONAL FALLBACKS) ---
const MOCK_QUESTIONNAIRE_MODEL = {
  modelId: 1,
  name: "Valoració del Taller",
  description: "Valoració pedagògica per al professorat",
  sections: [
    {
      sectionId: 1,
      name: "Aspectes Generals",
      questions: [
        { questionId: 1, text: "Com valores el contingut del taller?", type: "RATING" },
        { questionId: 2, text: "El material era adequat?", type: "YES_NO" }
      ]
    }
  ]
};

const MOCK_STUDENTS: any[] = [
  { enrollmentId: 1001, studentId: 101, student: { studentId: 101, idalu: 'ST001', fullName: 'Joan Vila', lastName: 'Vila' } },
  { enrollmentId: 1002, studentId: 102, student: { studentId: 102, idalu: 'ST002', fullName: 'Marta Soler', lastName: 'Soler' } }
];

const MOCK_WORKSHOP: any = {
  assignmentId: 999,
  workshop: {
    title: "Cine",
    icon: "videocam"
  },
  center: {
    name: "IES Brossa"
  },
  status: "PUBLISHED",
  group: 1
};

const getBaseURL = () => {
  // 1. Prioritize direct environment variable (Staging/Prod)
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // 2. Local development: Use the Host IP from Metro Bundler (192.168.x.x)
  // This is essential for physical devices to find the workstation
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    console.log(`📡 [API] Local Host IP detected: ${ip}`);
    return `http://${ip}:3000`;
  }
  
  // 3. Last fallback (Simulators)
  const FALLBACK_IP = process.env.EXPO_PUBLIC_LOCAL_IP || '127.0.0.1';
  return `http://${FALLBACK_IP}:3000`;
};

const api = axios.create({
  baseURL: getBaseURL().endsWith('/') ? getBaseURL() : `${getBaseURL()}/`,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

// Helper for Mock Users
const isDevelopment = __DEV__;
const isKnownTeacher = (email: string) => 
  email.endsWith('@brossa.cat') || email.endsWith('@pauclaris.cat') || email.includes('laura.martinez');

api.interceptors.request.use(
  async (config) => {
    console.log(`🌐 [API REQUEST] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
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
    } catch (error) {
      console.warn('⚠️ [API] Token read error:', error);
    }
    return config;
  },
  (error) => {
    console.error('❌ [API REQUEST ERROR]', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  async (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access if needed
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

export const getMyAssignments = () => 
  api.get<Assignment[]>('teachers/me/assignments');

export const getChecklist = (id: string | number) => 
  api.get(`assignments/${id}/checklist`);

export const getStudents = (id: string | number) => 
  api.get<Enrollment[]>(`assignments/${id}/students`);

// --- Questionnaires ---
export const getQuestionnaireModels = () => 
    api.get('questionnaires/models');

export const getQuestionnaireModel = (id: string | number) => 
    api.get(`questionnaires/model/${id}`);

export const postQuestionnaireResponse = (data: any) => 
    api.post('questionnaires/respond', data);

export const trackQuestionnaire = (data: any) => 
    api.post('questionnaires/track', data);

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

export const getCalendar = (start?: string, end?: string) => {
  const params = start && end ? `?start=${start}&end=${end}` : '';
  return api.get(`calendar${params}`);
};

export const getNotifications = () => 
  api.get<Notification[]>('notifications');

export default api;
