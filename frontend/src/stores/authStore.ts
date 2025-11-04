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
    // Frontend keeps tokens in Zustand state + sessionStorage for page refresh persistence
    // sessionStorage is automatically cleared when browser closes (safer than localStorage)
    const expiresAt = Date.now() + expiresIn * 1000;

    const authState = {
      user,
      church,
      isLoading: false,
      isAuthenticated: true,
      accessToken,
      refreshToken,
      tokenExpiresAt: expiresAt,
    };

    set(authState);

    // Persist to sessionStorage so session survives page refresh
    try {
      sessionStorage.setItem('authState', JSON.stringify(authState));
    } catch (e) {
      console.warn('Failed to persist auth state to sessionStorage');
    }
  },

  clearAuth: () => {
    // Clear from state and sessionStorage
    set({
      user: null,
      church: null,
      isLoading: false,
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      tokenExpiresAt: null,
    });

    try {
      sessionStorage.removeItem('authState');
    } catch (e) {
      console.warn('Failed to clear auth state from sessionStorage');
    }
  },

  logout: () => {
    // Tokens are cleared from state, sessionStorage, and cookies (via backend logout endpoint)
    set({
      user: null,
      church: null,
      isLoading: false,
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      tokenExpiresAt: null,
    });

    try {
      sessionStorage.removeItem('authState');
    } catch (e) {
      console.warn('Failed to clear auth state from sessionStorage');
    }
  },

  isTokenExpired: () => {
    const expiresAt = get().tokenExpiresAt;
    if (!expiresAt) return false;
    return Date.now() > expiresAt;
  },
}));

export default useAuthStore;
