/**
 * Hook to detect user inactivity and show logout warning
 * If no activity for IDLE_TIME, shows warning with countdown
 * If no activity for IDLE_TIME + WARNING_TIME, logs user out
 */
export declare function useIdleLogout(): {
    showWarning: boolean;
    secondsUntilLogout: number;
    handleLogout: () => Promise<void>;
    dismissWarning: () => void;
};
//# sourceMappingURL=useIdleLogout.d.ts.map