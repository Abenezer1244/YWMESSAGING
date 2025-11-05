import axios from 'axios';
import useAuthStore from '../stores/authStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : 'https://api.koinoniasms.com/api');

const client = axios.create({
  baseURL: API_BASE_URL,
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
    // CSRF token fetch failed - non-critical, some endpoints may not require it
    throw error;
  }
}

// Request interceptor - attach tokens and CSRF token
client.interceptors.request.use((config) => {
  // ✅ SECURITY: Tokens are in HTTPOnly cookies AND Authorization header
  // HTTPOnly cookies: secure, sent automatically by browser with withCredentials: true
  // Authorization header: backup for cross-domain requests (cookies sometimes unreliable)

  // Set Content-Type for JSON requests (not FormData)
  // FormData requests will have Content-Type auto-set by axios with boundary
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }

  // Add access token to Authorization header for all requests
  const state = useAuthStore.getState();
  if (state.accessToken) {
    config.headers['Authorization'] = `Bearer ${state.accessToken}`;
  }

  // Add CSRF token to POST, PUT, DELETE, PATCH requests
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(config.method?.toUpperCase() || '')) {
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
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
          // ✅ SECURITY: Refresh token is in HTTPOnly cookie, sent automatically with withCredentials
          // No need to manually send token in Authorization header

          // Send refresh request (cookie is sent automatically)
          const response = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            {},
            {
              withCredentials: true,
            }
          );

          // Update tokens in store (cookies are already updated by server)
          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          const state = useAuthStore.getState();
          if (state.user && state.church) {
            state.setAuth(state.user, state.church, accessToken, newRefreshToken);
          }

          isRefreshing = false;

          // Retry original request (will use new cookie automatically)
          return client(originalRequest);
        } catch (refreshError) {
          // If refresh fails, logout
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
