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
export declare function FeaturedCard({ title, description, gradient, imageSrc, imageAlt, actionLabel, onAction, isDark, index, }: FeaturedCardProps): any;
export {};
//# sourceMappingURL=FeaturedCard.d.ts.map