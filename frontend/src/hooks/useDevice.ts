import { useState, useEffect } from 'react';

/**
 * Return type for useDevice hook
 */
export interface UseDeviceReturn {
  hasTouch: boolean;
  isPortrait: boolean;
  isLandscape: boolean;
}

/**
 * Hook for detecting device capabilities (touch support, orientation)
 * Useful for adapting UX to device type and orientation
 *
 * @returns UseDeviceReturn - Device capabilities and orientation
 *
 * @example
 * const { hasTouch, isPortrait } = useDevice();
 *
 * if (hasTouch) {
 *   // Use larger touch targets
 * }
 *
 * if (isPortrait) {
 *   return <PortraitLayout />;
 * }
 */
export function useDevice(): UseDeviceReturn {
  const [hasTouch, setHasTouch] = useState(false);
  const [isPortrait, setIsPortrait] = useState(true);

  useEffect(() => {
    // Detect touch support
    const detectTouch = () => {
      const touch =
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        (navigator as any).msMaxTouchPoints > 0;
      setHasTouch(touch);
    };

    // Detect orientation
    const updateOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };

    // Initial detection
    detectTouch();
    updateOrientation();

    // Listen for resize and orientation changes
    const handleResize = () => {
      updateOrientation();
    };

    const handleOrientationChange = () => {
      updateOrientation();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return {
    hasTouch,
    isPortrait,
    isLandscape: !isPortrait,
  };
}
