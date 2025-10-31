import { create } from 'zustand';
const useAuthStore = create()((set, get) => ({
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
        if (!expiresAt)
            return false;
        return Date.now() > expiresAt;
    },
}));
export default useAuthStore;
//# sourceMappingURL=authStore.js.map