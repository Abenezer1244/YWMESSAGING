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
  tokenExpiresAt: number | null; // Timestamp when token expires

  // Actions
  setAuth: (
    user: Admin,
    church: Church,
    accessToken: string,
    refreshToken: string,
    expiresIn?: number
  ) => void;
  clearAuth: () => void;
  logout: () => void;
  isTokenExpired: () => boolean;
}

const useAuthStore = create<AuthState>()((set, get) => ({
  // State
  user: null,
  church: null,
  isLoading: false,
  isAuthenticated: false,
  accessToken: null,
  refreshToken: null,
  tokenExpiresAt: null,

  // Actions
  setAuth: (user, church, accessToken, refreshToken, expiresIn = 3600) => {
    // ✅ SECURITY: Tokens are stored in HTTPOnly cookies by the backend
    // Frontend keeps tokens in Zustand state only for UI purposes
    // Tokens are NOT stored in localStorage (prevents XSS attacks)
    const expiresAt = Date.now() + expiresIn * 1000;

    set({
      user,
      church,
      isLoading: false,
      isAuthenticated: true,
      accessToken,
      refreshToken,
      tokenExpiresAt: expiresAt,
    });
  },

  clearAuth: () => {
    // Tokens are cleared from state only (already removed from localStorage for security)
    set({
      user: null,
      church: null,
      isLoading: false,
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      tokenExpiresAt: null,
    });
  },

  logout: () => {
    // Tokens are cleared from state and cookies (via backend logout endpoint)
    set({
      user: null,
      church: null,
      isLoading: false,
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      tokenExpiresAt: null,
    });
  },

  isTokenExpired: () => {
    const expiresAt = get().tokenExpiresAt;
    if (!expiresAt) return false;
    return Date.now() > expiresAt;
  },
}));

export default useAuthStore;
