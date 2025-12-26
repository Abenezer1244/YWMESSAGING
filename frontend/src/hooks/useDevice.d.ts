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
export declare function useDevice(): UseDeviceReturn;
//# sourceMappingURL=useDevice.d.ts.map