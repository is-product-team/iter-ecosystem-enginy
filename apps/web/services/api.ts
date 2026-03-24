import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  console.warn('⚠️ NEXT_PUBLIC_API_URL is not defined. API calls might fail.');
}

// Create a singleton instance
const apiInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000, // Slightly longer timeout
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

// Request Interceptor: Inject Token (Only if still using Bearer, but now we prefer cookies)
apiInstance.interceptors.request.use(
  (config) => {
    // Note: withCredentials: true handles cookies automatically
    return config;
  },
  (error) => Promise.reject(error)
);

    apiInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          if (typeof window !== 'undefined') {
            console.warn('Sesión expirada (401). Redirigiendo a login...');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );

// Response Interceptor: Handle 401 and Redirect
apiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response ? error.response.status : null;

    if (status === 401) {
      console.error('[AUTH-API] 401 Unauthorized detected. Redirecting to login...');

      if (typeof window !== 'undefined') {
        // Clear local session
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Prevent redirect loops
        if (!window.location.pathname.includes('/login')) {
          // Hard redirect using replace to clear history and avoid back-button issues
          console.log('[AUTH-API] Triggering window.location.replace(/login)');
          window.location.replace('/login');

          // Fallback forced redirect
          setTimeout(() => {
            window.location.href = '/login';
          }, 200);
        }
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Returns the global API instance.
 * For context-specific hooks, use AuthContext instead.
 */
const getApi = (): AxiosInstance => apiInstance;

export default getApi;