interface DeliveryStatusBadgeProps {
    dlcStatus?: string;
    deliveryRate?: number;
    wantsPremiumDelivery?: boolean;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'badge' | 'card' | 'inline';
}
/**
 * Reusable component to display SMS delivery tier status
 * Shows current delivery rate and approval status
 */
export declare function DeliveryStatusBadge({ dlcStatus, deliveryRate, wantsPremiumDelivery, size, variant, }: DeliveryStatusBadgeProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=DeliveryStatusBadge.d.ts.map