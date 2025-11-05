interface IdleLogoutWarningProps {
    isOpen: boolean;
    secondsUntilLogout: number;
    onDismiss: () => void;
    onLogout: () => void;
}
export declare function IdleLogoutWarning({ isOpen, secondsUntilLogout, onDismiss, onLogout, }: IdleLogoutWarningProps): import("react/jsx-runtime").JSX.Element | null;
export {};
//# sourceMappingURL=IdleLogoutWarning.d.ts.map