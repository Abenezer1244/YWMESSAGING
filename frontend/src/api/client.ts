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

// Response interceptor - handle token refresh
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retrying, try to refresh token via cookies
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Send refresh request - cookies are automatically included
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
          withCredentials: true,
        });

        // Response will set new cookies automatically
        // Retry original request
        return client(originalRequest);
      } catch (refreshError) {
        // If refresh fails, logout
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default client;
