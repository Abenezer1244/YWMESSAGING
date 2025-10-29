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

  // Computed
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

  // Computed
  get isAuthenticated() {
    return get().user !== null;
  },

  // Actions
  setAuth: (user, church) => {
    set({
      user,
      church,
      isLoading: false,
    });
  },

  clearAuth: () => {
    set({
      user: null,
      church: null,
      isLoading: false,
    });
  },

  logout: () => {
    set({
      user: null,
      church: null,
      isLoading: false,
    });
  },
}));

export default useAuthStore;
