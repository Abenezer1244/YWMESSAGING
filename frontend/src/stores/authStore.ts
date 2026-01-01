import { create } from 'zustand';
import { logout as logoutApi } from '../api/auth';
import { createSelectors } from '../hooks/createSelectors';
import { useBranchStore } from './branchStore';
import { useChatStore } from './chatStore';
import { useMessageStore } from './messageStore';

export interface Admin {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  welcomeCompleted?: boolean;
  userRole?: string;
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
  logout: () => Promise<void>;
  isTokenExpired: () => boolean;
}

const useAuthStoreBase = create<AuthState>()((set, get) => ({
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
    // ✅ CRITICAL: Clear all data stores to prevent tenant isolation breach
    // When switching between accounts (login/register), ALL previous user's data must be cleared
    // This prevents the new user from seeing the previous user's branches/messages/chat/data
    try {
      useBranchStore.getState().reset();
      useChatStore.getState().reset();
      useMessageStore.getState().reset();
    } catch (e) {
      console.warn('Failed to clear data stores:', e);
    }

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

  logout: async () => {
    // Call backend logout endpoint to clear HTTPOnly cookies
    try {
      await logoutApi();
    } catch (error) {
      console.warn('Failed to call logout endpoint', error);
      // Continue with local logout even if API call fails
    }

    // ✅ CRITICAL: Clear all data stores to prevent data leakage
    // When user logs out, ALL previous user's data must be cleared
    // This prevents a new user from seeing the previous user's branches/messages/chat/data
    try {
      useBranchStore.getState().reset();
      useChatStore.getState().reset();
      useMessageStore.getState().reset();
    } catch (e) {
      console.warn('Failed to clear store data:', e);
    }

    // Clear local state
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

/**
 * Auth Store with Auto-Generated Selectors
 *
 * Usage:
 * ✅ Recommended: useAuthStore.use.user()
 * ✅ Recommended: useAuthStore.use.isAuthenticated()
 * ✅ Manual (still works): useAuthStore((state) => state.user)
 *
 * Benefits of selectors:
 * - Only re-renders when the selected value actually changes
 * - Better performance for components using multiple store values
 * - Type-safe with autocomplete
 */
export const useAuthStore = createSelectors(useAuthStoreBase);
