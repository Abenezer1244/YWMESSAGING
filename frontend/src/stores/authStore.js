import { create } from 'zustand';
const useAuthStore = create()((set, get) => ({
    // State
    user: null,
    church: null,
    isLoading: false,
    isAuthenticated: false,
    accessToken: null,
    refreshToken: null,
    // Actions
    setAuth: (user, church, accessToken, refreshToken) => {
        console.log('authStore.setAuth called with:', { user, church, accessToken: accessToken ? 'present' : 'missing' });
        // Store tokens in localStorage for persistence across page refreshes
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        set({
            user,
            church,
            isLoading: false,
            isAuthenticated: true,
            accessToken,
            refreshToken,
        });
        console.log('authStore.setAuth complete, new state:', {
            user: get().user,
            church: get().church,
            isAuthenticated: get().isAuthenticated,
        });
    },
    clearAuth: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({
            user: null,
            church: null,
            isLoading: false,
            isAuthenticated: false,
            accessToken: null,
            refreshToken: null,
        });
    },
    logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({
            user: null,
            church: null,
            isLoading: false,
            isAuthenticated: false,
            accessToken: null,
            refreshToken: null,
        });
    },
}));
export default useAuthStore;
//# sourceMappingURL=authStore.js.map