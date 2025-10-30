import axios from 'axios';
import useAuthStore from '../stores/authStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable sending cookies with requests
});

// Fetch and cache CSRF token
let csrfToken = '';
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

export async function fetchCsrfToken(): Promise<string> {
  try {
    const response = await axios.get(`${API_BASE_URL}/csrf-token`, {
      withCredentials: true,
    });
    csrfToken = response.data.csrfToken;
    return csrfToken;
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
    throw error;
  }
}

// Request interceptor - attach CSRF token for state-changing requests
client.interceptors.request.use((config) => {
  // Add CSRF token to POST, PUT, DELETE, PATCH requests
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(config.method?.toUpperCase() || '')) {
    config.headers['X-CSRF-Token'] = csrfToken;
  }
  return config;
});

// Response interceptor - handle token refresh (but prevent infinite loops)
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only retry on 401 for non-auth endpoints
    const isAuthEndpoint = originalRequest.url?.includes('/auth/');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          // Send refresh request - cookies are automatically included
          await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
            withCredentials: true,
          });

          // Response will set new cookies automatically
          isRefreshing = false;

          // Retry original request
          return client(originalRequest);
        } catch (refreshError) {
          // If refresh fails, just logout without reloading
          isRefreshing = false;
          useAuthStore.getState().logout();
          // Don't do window.location.href - let React Router handle it
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default client;
