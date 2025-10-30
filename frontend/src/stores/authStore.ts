import { create } from 'zustand';

export interface Admin {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface Church {
  id: string;
  name: string;
  email: string;
  trialEndsAt: string;
}

interface AuthState {
  // State
  user: Admin | null;
  church: Church | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;

  // Actions
  setAuth: (user: Admin, church: Church, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  logout: () => void;
}

const useAuthStore = create<AuthState>()((set, get) => ({
  // State
  user: null,
  church: null,
  isLoading: false,
  isAuthenticated: false,
  accessToken: null,
  refreshToken: null,

  // Actions
  setAuth: (user, church, accessToken, refreshToken) => {
    console.log('authStore.setAuth called with:', { user, church, accessToken: accessToken ? 'present' : 'missing' });
    // Store tokens in localStorage for persistence across page refreshes
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    set({
      user,
      church,
      isLoading: false,
      isAuthenticated: true,
      accessToken,
      refreshToken,
    });
    console.log('authStore.setAuth complete, new state:', {
      user: get().user,
      church: get().church,
      isAuthenticated: get().isAuthenticated,
    });
  },

  clearAuth: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({
      user: null,
      church: null,
      isLoading: false,
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
    });
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({
      user: null,
      church: null,
      isLoading: false,
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
    });
  },
}));

export default useAuthStore;
