/**
 * Breakpoint type for semantic responsive design
 */
export type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'wide' | 'ultraWide';
/**
 * Return type for useBreakpoint hook
 */
export interface UseBreakpointReturn {
    current: Breakpoint;
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    isWide: boolean;
    isUltraWide: boolean;
}
/**
 * Hook for detecting current breakpoint and responsive state
 * Provides semantic breakpoint detection aligned with design tokens
 *
 * @returns UseBreakpointReturn - Current breakpoint and boolean flags
 *
 * @example
 * const { isMobile, isTablet, current } = useBreakpoint();
 *
 * if (isMobile) {
 *   return <MobileLayout />;
 * }
 *
 * return <DesktopLayout />;
 */
export declare function useBreakpoint(): UseBreakpointReturn;
//# sourceMappingURL=useBreakpoint.d.ts.map