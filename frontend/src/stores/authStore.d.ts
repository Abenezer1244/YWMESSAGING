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
export declare const useAuthStore: {
    (): AuthState;
    <U>(selector: (state: AuthState) => U): U;
    <U>(selector: (state: AuthState) => U, equalityFn: (a: U, b: U) => boolean): U;
} & import("zustand").StoreApi<AuthState> & {
    use: {
        user: () => Admin | null;
        church: () => Church | null;
        isLoading: () => boolean;
        isAuthenticated: () => boolean;
        accessToken: () => string | null;
        refreshToken: () => string | null;
        tokenExpiresAt: () => number | null;
        setAuth: () => (user: Admin, church: Church, accessToken: string, refreshToken: string, expiresIn?: number) => void;
        clearAuth: () => () => void;
        logout: () => () => Promise<void>;
        isTokenExpired: () => () => boolean;
    };
};
export {};
//# sourceMappingURL=authStore.d.ts.map