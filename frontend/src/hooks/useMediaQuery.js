import { useState, useEffect } from 'react';
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
export function useMediaQuery(query) {
    const [matches, setMatches] = useState(false);
    useEffect(() => {
        const mediaQuery = window.matchMedia(query);
        // Set initial value
        setMatches(mediaQuery.matches);
        // Create listener for changes
        const handleChange = (e) => {
            setMatches(e.matches);
        };
        // Add listener
        mediaQuery.addEventListener('change', handleChange);
        // Cleanup
        return () => {
            mediaQuery.removeEventListener('change', handleChange);
        };
    }, [query]);
    return matches;
}
//# sourceMappingURL=useMediaQuery.js.map