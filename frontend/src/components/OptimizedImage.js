import { jsx as _jsx } from "react/jsx-runtime";
/**
 * OptimizedImage Component
 * Combines native and Intersection Observer lazy loading with priority loading for above-the-fold images
 *
 * Features:
 * - Priority loading for above-the-fold images (eager loading, high fetchpriority)
 * - Lazy loading for below-the-fold images via Intersection Observer
 * - Responsive images with srcSet support
 * - Proper width/height attributes to prevent Cumulative Layout Shift (CLS)
 * - Async decoding to prevent blocking main thread
 */
import React from 'react';
import { LazyImage } from './LazyImage';
/**
 * OptimizedImage Component
 * Chooses between priority and lazy loading based on whether image is above/below the fold
 *
 * Priority Loading (above-the-fold):
 * - loading="eager" to load immediately
 * - fetchpriority="high" to prioritize this resource
 * - Preload resource hints in parent
 *
 * Lazy Loading (below-the-fold):
 * - Uses LazyImage component with Intersection Observer
 * - loading="lazy" as native fallback
 * - Defers loading until approaching viewport
 */
export const OptimizedImage = React.forwardRef(({ src, alt, priority = false, fallback, srcSet, sizes, width, height, className, onLoad, onError, style, ...props }, ref) => {
    // Above-the-fold image: Use eager loading with high priority
    if (priority) {
        return (_jsx("img", { ref: ref, src: src, alt: alt, srcSet: srcSet, sizes: sizes, width: width, height: height, loading: "eager", fetchPriority: "high", decoding: "async", onLoad: onLoad, onError: onError, className: className, style: {
                maxWidth: '100%',
                height: 'auto',
                ...style,
            }, ...props }));
    }
    // Below-the-fold image: Use lazy loading
    return (_jsx(LazyImage, { ref: ref, src: src, alt: alt, fallback: fallback, srcSet: srcSet, sizes: sizes, width: width, height: height, onLoad: onLoad, onError: onError, className: className, style: {
            maxWidth: '100%',
            height: 'auto',
            ...style,
        }, ...props }));
});
OptimizedImage.displayName = 'OptimizedImage';
//# sourceMappingURL=OptimizedImage.js.map