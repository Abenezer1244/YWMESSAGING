interface WelcomeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onWelcomeComplete?: (userRole: string, welcomeCompleted: boolean) => void;
}
export default function WelcomeModal({ isOpen, onClose, onWelcomeComplete }: WelcomeModalProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=WelcomeModal.d.ts.map