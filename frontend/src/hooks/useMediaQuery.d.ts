/**
 * Hook for detecting media query matches
 * Useful for responsive behavior in React components
 * SSR safe - returns false during SSR, updates on client
 *
 * @param query - Media query string (e.g., '(min-width: 768px)')
 * @returns boolean - Whether the media query matches
 *
 * @example
 * const isTablet = useMediaQuery('(min-width: 768px)');
 * const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
 */
export declare function useMediaQuery(query: string): boolean;
//# sourceMappingURL=useMediaQuery.d.ts.map