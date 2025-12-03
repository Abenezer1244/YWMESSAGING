/**
 * NPS Survey Component
 * Simple, non-intrusive survey widget for collecting customer feedback
 * Appears after user has been active for 5+ minutes
 */
interface NPSSurveyProps {
    onSubmit?: () => void;
    onClose?: () => void;
}
export declare function NPSSurvey({ onSubmit, onClose }: NPSSurveyProps): import("react/jsx-runtime").JSX.Element;
/**
 * Hook to manage NPS survey visibility
 */
export declare function useNPSSurvey(): {
    showSurvey: boolean;
    handleClose: () => void;
    handleSubmit: () => void;
};
export {};
//# sourceMappingURL=NPSSurvey.d.ts.map