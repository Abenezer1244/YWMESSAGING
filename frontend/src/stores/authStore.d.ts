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
    accessToken: string | null;
    refreshToken: string | null;
    tokenExpiresAt: number | null;
    setAuth: (user: Admin, church: Church, accessToken: string, refreshToken: string, expiresIn?: number) => void;
    clearAuth: () => void;
    logout: () => Promise<void>;
    isTokenExpired: () => boolean;
}
declare const useAuthStore: import("zustand").UseBoundStore<import("zustand").StoreApi<AuthState>>;
export default useAuthStore;
//# sourceMappingURL=authStore.d.ts.map