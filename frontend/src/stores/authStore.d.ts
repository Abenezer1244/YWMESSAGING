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
    user: Admin | null;
    church: Church | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    setAuth: (user: Admin, church: Church) => void;
    clearAuth: () => void;
    logout: () => void;
}
declare const useAuthStore: import("zustand").UseBoundStore<import("zustand").StoreApi<AuthState>>;
export default useAuthStore;
//# sourceMappingURL=authStore.d.ts.map