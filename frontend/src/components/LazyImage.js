import { jsx as _jsx } from "react/jsx-runtime";
/**
 * LazyImage Component
 * Defers image loading until the image is about to be viewed (Intersection Observer)
 * Falls back to native lazy loading for older browsers
 *
 * Benefits:
 * - Reduces initial page load time
 * - Lower bandwidth usage (off-screen images not loaded)
 * - Improves Core Web Vitals (LCP, CLS)
 * - Better performance on slow networks
 */
import React, { useEffect, useRef, useState } from 'react';
/**
 * LazyImage Component
 * Uses Intersection Observer for optimal performance
 * Lazy loads images when they enter the viewport
 */
export const LazyImage = React.forwardRef(({ src, alt, fallback, onLoad, onError, className, style, ...props }, ref) => {
    const imgRef = useRef(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    useEffect(() => {
        const img = imgRef.current;
        if (!img)
            return;
        // Check if browser supports Intersection Observer
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        // Image is about to be visible, start loading
                        img.src = src;
                        observer.unobserve(img);
                        // Remove the placeholder once loaded
                        img.onload = () => {
                            setIsLoaded(true);
                            onLoad?.();
                        };
                        img.onerror = () => {
                            setImageError(true);
                            onError?.();
                        };
                    }
                });
            }, {
                // Start loading 50px before image enters viewport
                rootMargin: '50px',
            });
            observer.observe(img);
            return () => {
                observer.disconnect();
            };
        }
        else {
            // Fallback for browsers without Intersection Observer support
            // Just load the image normally
            img.src = src;
            setIsLoaded(true);
        }
    }, [src, onLoad, onError]);
    return (_jsx("img", { ref: imgRef, alt: alt, className: `${className || ''} ${!isLoaded && fallback ? 'blur-sm' : ''}`, style: {
            transition: 'filter 0.3s ease-in-out',
            ...style,
        }, "data-src": src, 
        // Fallback image while loading
        src: fallback || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3C/svg%3E', loading: "lazy", ...props }));
});
LazyImage.displayName = 'LazyImage';
//# sourceMappingURL=LazyImage.js.map