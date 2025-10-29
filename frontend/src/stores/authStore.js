import { create } from 'zustand';
const useAuthStore = create()((set, get) => ({
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
//# sourceMappingURL=authStore.js.map