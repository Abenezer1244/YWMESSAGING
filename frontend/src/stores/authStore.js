import { create } from 'zustand';
import { logout as logoutApi } from '../api/auth';
import { createSelectors } from '../hooks/createSelectors';
const useAuthStoreBase = create()((set, get) => ({
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
        }
        catch (e) {
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
        }
        catch (e) {
            console.warn('Failed to clear auth state from sessionStorage');
        }
    },
    logout: async () => {
        // Call backend logout endpoint to clear HTTPOnly cookies
        try {
            await logoutApi();
        }
        catch (error) {
            console.warn('Failed to call logout endpoint', error);
            // Continue with local logout even if API call fails
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
        }
        catch (e) {
            console.warn('Failed to clear auth state from sessionStorage');
        }
    },
    isTokenExpired: () => {
        const expiresAt = get().tokenExpiresAt;
        if (!expiresAt)
            return false;
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
//# sourceMappingURL=authStore.js.map