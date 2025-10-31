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
        if (!expiresAt)
            return false;
        return Date.now() > expiresAt;
    },
}));
export default useAuthStore;
//# sourceMappingURL=authStore.js.map