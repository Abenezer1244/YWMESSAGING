import { useMediaQuery } from './useMediaQuery';
/**
 * Breakpoint definitions aligned with design tokens
 * - mobile: < 768px (default)
 * - tablet: 768px - 1024px (Tailwind md:)
 * - desktop: 1024px - 1440px (Tailwind lg:)
 * - wide: 1440px - 1920px (Tailwind xl:)
 * - ultraWide: >= 1920px (Tailwind 2xl:)
 */
const BREAKPOINTS = {
    tablet: 768,
    desktop: 1024,
    wide: 1440,
    ultraWide: 1920,
};
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
export function useBreakpoint() {
    // Use pixel values for media queries to align with Tailwind breakpoints
    const isTablet = useMediaQuery(`(min-width: ${BREAKPOINTS.tablet}px)`);
    const isDesktop = useMediaQuery(`(min-width: ${BREAKPOINTS.desktop}px)`);
    const isWide = useMediaQuery(`(min-width: ${BREAKPOINTS.wide}px)`);
    const isUltraWide = useMediaQuery(`(min-width: ${BREAKPOINTS.ultraWide}px)`);
    // Determine current breakpoint
    let current = 'mobile';
    if (isUltraWide) {
        current = 'ultraWide';
    }
    else if (isWide) {
        current = 'wide';
    }
    else if (isDesktop) {
        current = 'desktop';
    }
    else if (isTablet) {
        current = 'tablet';
    }
    return {
        current,
        isMobile: !isTablet,
        isTablet,
        isDesktop,
        isWide,
        isUltraWide,
    };
}
//# sourceMappingURL=useBreakpoint.js.map