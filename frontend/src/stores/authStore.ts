import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;

  // Computed
  isAuthenticated: boolean;

  // Actions
  setAuth: (user: Admin, church: Church, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  setAccessToken: (token: string) => void;
  setRefreshToken: (token: string) => void;
  logout: () => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      church: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,

      // Computed
      get isAuthenticated() {
        return get().accessToken !== null;
      },

      // Actions
      setAuth: (user, church, accessToken, refreshToken) => {
        set({
          user,
          church,
          accessToken,
          refreshToken,
          isLoading: false,
        });
      },

      clearAuth: () => {
        set({
          user: null,
          church: null,
          accessToken: null,
          refreshToken: null,
          isLoading: false,
        });
      },

      setAccessToken: (token) => {
        set({ accessToken: token });
      },

      setRefreshToken: (token) => {
        set({ refreshToken: token });
      },

      logout: () => {
        set({
          user: null,
          church: null,
          accessToken: null,
          refreshToken: null,
          isLoading: false,
        });
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        church: state.church,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);

export default useAuthStore;
