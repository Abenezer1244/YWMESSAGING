interface FeaturedCardProps {
    title: string;
    description: string;
    gradient: string;
    imageSrc?: string;
    imageAlt?: string;
    actionLabel?: string;
    onAction?: () => void;
    isDark?: boolean;
    index?: number;
}
declare function FeaturedCardComponent({ title, description, gradient, imageSrc, imageAlt, actionLabel, onAction, isDark, index, }: FeaturedCardProps): import("react/jsx-runtime").JSX.Element;
/**
 * Memoized FeaturedCard component
 * Prevents re-renders when parent component updates but props remain the same
 * Optimized for featured content sections that render multiple cards
 */
export declare const FeaturedCard: import("react").MemoExoticComponent<typeof FeaturedCardComponent>;
export {};
//# sourceMappingURL=FeaturedCard.d.ts.map