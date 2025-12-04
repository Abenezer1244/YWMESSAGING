import { useEffect } from 'react';
import { onCLS, onFCP, onLCP, onINP, onTTFB } from 'web-vitals';
import ReactGA from 'react-ga4';
/**
 * Hook to collect and send Web Vitals metrics to Google Analytics 4
 *
 * Tracks:
 * - LCP (Largest Contentful Paint): ≤ 2.5s (good)
 * - INP (Interaction to Next Paint): ≤ 200ms (good)
 * - CLS (Cumulative Layout Shift): ≤ 0.1 (good)
 * - FCP (First Contentful Paint): ≤ 1.8s (good)
 * - TTFB (Time to First Byte): ≤ 600ms (good)
 */
export function useWebVitals() {
    useEffect(() => {
        // Only track in production environment
        if (import.meta.env.MODE !== 'production') {
            return;
        }
        // Largest Contentful Paint (LCP)
        // Measures when the main content has finished painting
        // Good: ≤ 2.5s
        onLCP((metric) => {
            console.log('[Web Vitals] LCP:', metric.value, 'ms', 'Rating:', metric.rating);
            ReactGA.event('web_vitals_lcp', {
                value: Math.round(metric.value),
                rating: metric.rating,
                event_category: 'web_vitals',
                event_label: 'LCP',
            });
        });
        // Interaction to Next Paint (INP)
        // Measures responsiveness to user interactions
        // Good: ≤ 200ms
        onINP((metric) => {
            console.log('[Web Vitals] INP:', metric.value, 'ms', 'Rating:', metric.rating);
            ReactGA.event('web_vitals_inp', {
                value: Math.round(metric.value),
                rating: metric.rating,
                event_category: 'web_vitals',
                event_label: 'INP',
            });
        });
        // Cumulative Layout Shift (CLS)
        // Measures visual stability
        // Good: ≤ 0.1
        onCLS((metric) => {
            console.log('[Web Vitals] CLS:', metric.value, 'Rating:', metric.rating);
            ReactGA.event('web_vitals_cls', {
                value: Math.round(metric.value * 1000) / 1000, // Keep 3 decimal places
                rating: metric.rating,
                event_category: 'web_vitals',
                event_label: 'CLS',
            });
        });
        // First Contentful Paint (FCP)
        // Measures when first content appears
        // Good: ≤ 1.8s
        onFCP((metric) => {
            console.log('[Web Vitals] FCP:', metric.value, 'ms', 'Rating:', metric.rating);
            ReactGA.event('web_vitals_fcp', {
                value: Math.round(metric.value),
                rating: metric.rating,
                event_category: 'web_vitals',
                event_label: 'FCP',
            });
        });
        // Time to First Byte (TTFB)
        // Measures server response time
        // Good: ≤ 600ms
        onTTFB((metric) => {
            console.log('[Web Vitals] TTFB:', metric.value, 'ms', 'Rating:', metric.rating);
            ReactGA.event('web_vitals_ttfb', {
                value: Math.round(metric.value),
                rating: metric.rating,
                event_category: 'web_vitals',
                event_label: 'TTFB',
            });
        });
    }, []);
}
//# sourceMappingURL=useWebVitals.js.map