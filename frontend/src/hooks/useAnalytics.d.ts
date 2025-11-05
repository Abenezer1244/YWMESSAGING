export declare function initializePostHog(): void;
/**
 * Hook for tracking analytics events
 * Usage: const { track } = useAnalytics()
 */
export declare function useAnalytics(): {
    track: (eventName: string, properties?: Record<string, any>) => void;
    posthog: any;
};
export default useAnalytics;
//# sourceMappingURL=useAnalytics.d.ts.map