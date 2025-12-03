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
import React, { ImgHTMLAttributes } from 'react';
interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    priority?: boolean;
    fallback?: string;
    srcSet?: string;
    sizes?: string;
    width?: number;
    height?: number;
    onLoad?: () => void;
    onError?: () => void;
}
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
export declare const OptimizedImage: React.ForwardRefExoticComponent<OptimizedImageProps & React.RefAttributes<HTMLImageElement>>;
export {};
/**
 * Usage Examples:
 *
 * 1. Hero image (above-the-fold, priority loading):
 *    <OptimizedImage
 *      src="/hero.jpg"
 *      alt="Hero"
 *      width={1440}
 *      height={600}
 *      priority
 *    />
 *
 * 2. Gallery image (below-the-fold, lazy loading):
 *    <OptimizedImage
 *      src="/gallery-1.jpg"
 *      alt="Gallery item"
 *      width={400}
 *      height={300}
 *      className="rounded-lg"
 *    />
 *
 * 3. Responsive image with srcSet:
 *    <OptimizedImage
 *      src="/image-800w.jpg"
 *      srcSet="
 *        /image-400w.jpg 400w,
 *        /image-800w.jpg 800w,
 *        /image-1200w.jpg 1200w
 *      "
 *      sizes="(max-width: 600px) 400px, (max-width: 1200px) 800px, 1200px"
 *      alt="Description"
 *      width={800}
 *      height={600}
 *    />
 *
 * 4. With fallback (blurred placeholder):
 *    <OptimizedImage
 *      src="/large-image.jpg"
 *      alt="Description"
 *      fallback="/tiny-blurred.jpg"
 *      width={800}
 *      height={600}
 *    />
 */
//# sourceMappingURL=OptimizedImage.d.ts.map