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

  // Actions
  setAuth: (user: Admin, church: Church) => void;
  clearAuth: () => void;
  logout: () => void;
}

const useAuthStore = create<AuthState>()((set, get) => ({
  // State
  user: null,
  church: null,
  isLoading: false,
  isAuthenticated: false,

  // Actions
  setAuth: (user, church) => {
    console.log('authStore.setAuth called with:', { user, church });
    set({
      user,
      church,
      isLoading: false,
      isAuthenticated: true, // Explicitly set isAuthenticated to true
    });
    console.log('authStore.setAuth complete, new state:', {
      user: get().user,
      church: get().church,
      isAuthenticated: get().isAuthenticated,
    });
  },

  clearAuth: () => {
    set({
      user: null,
      church: null,
      isLoading: false,
      isAuthenticated: false,
    });
  },

  logout: () => {
    set({
      user: null,
      church: null,
      isLoading: false,
      isAuthenticated: false,
    });
  },
}));

export default useAuthStore;
