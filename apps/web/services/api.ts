import axios, { AxiosInstance } from 'axios';
import { env } from '@/config/env';

const isServer = typeof window === 'undefined';
const API_URL = isServer && env.INTERNAL_API_URL 
  ? env.INTERNAL_API_URL 
  : env.NEXT_PUBLIC_API_URL;

const basePath = process.env.NODE_ENV === 'production' ? '/iter' : '';

/**
 * Global API Instance configured for Cookie-based Auth
 */
const apiInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  withCredentials: true, // Critical for Cookies
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

// Response Interceptor: Handle 401 Unauthorized globally
apiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response ? error.response.status : null;

    if (status === 401) {
      console.error('[AUTH] session expired or unauthorized. Redirecting to login...');

      if (typeof window !== 'undefined') {
        // We only clear user data, cookies are handled by the browser/backend
        localStorage.removeItem('user');

        // Avoid infinite redirect loops if we are already on the login page
        if (!window.location.pathname.includes('/login')) {
          window.location.replace(`${basePath}/`);
        }
      }
    }

    return Promise.reject(error);
  }
);

const getApi = (): AxiosInstance => apiInstance;

export default getApi;
