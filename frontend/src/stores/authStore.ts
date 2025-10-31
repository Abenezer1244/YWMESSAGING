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
    // ⚠️ SECURITY NOTE: Tokens stored in localStorage are vulnerable to XSS attacks.
    // In production, migrate to HTTPOnly + Secure cookies set by backend.
    // See SECURITY_AUDIT.md for details.
    const expiresAt = Date.now() + expiresIn * 1000;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('tokenExpiresAt', expiresAt.toString());

    set({
      user,
      church,
      isLoading: false,
      isAuthenticated: true,
      accessToken,
      refreshToken,
      tokenExpiresAt: expiresAt,
    });

    if (process.env.NODE_ENV === 'development') {
      console.debug('Authentication state updated');
    }
  },

  clearAuth: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiresAt');
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
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiresAt');
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
