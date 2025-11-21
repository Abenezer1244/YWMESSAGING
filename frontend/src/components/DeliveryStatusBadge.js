import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Reusable component to display SMS delivery tier status
 * Shows current delivery rate and approval status
 */
export function DeliveryStatusBadge({ dlcStatus, deliveryRate, wantsPremiumDelivery, size = 'md', variant = 'badge', }) {
    // Determine display text and styling
    const getStatusDisplay = () => {
        if (dlcStatus === 'shared_brand') {
            return {
                emoji: '📊',
                text: 'Standard Delivery',
                subtext: '65% delivery rate',
                bgColor: 'bg-blue-50',
                textColor: 'text-blue-900',
                borderColor: 'border-blue-200',
                badgeBg: 'bg-blue-100',
                badgeText: 'text-blue-800',
            };
        }
        if (dlcStatus === 'approved') {
            return {
                emoji: '✅',
                text: 'Premium 10DLC',
                subtext: '99% delivery rate',
                bgColor: 'bg-green-50',
                textColor: 'text-green-900',
                borderColor: 'border-green-200',
                badgeBg: 'bg-green-100',
                badgeText: 'text-green-800',
            };
        }
        if (dlcStatus === 'pending' || dlcStatus === 'brand_verified' || dlcStatus === 'campaign_pending') {
            return {
                emoji: '⏳',
                text: 'Pending Approval',
                subtext: 'Premium 10DLC (99% when approved)',
                bgColor: 'bg-yellow-50',
                textColor: 'text-yellow-900',
                borderColor: 'border-yellow-200',
                badgeBg: 'bg-yellow-100',
                badgeText: 'text-yellow-800',
            };
        }
        if (dlcStatus === 'rejected') {
            return {
                emoji: '❌',
                text: 'Approval Failed',
                subtext: 'Contact support',
                bgColor: 'bg-red-50',
                textColor: 'text-red-900',
                borderColor: 'border-red-200',
                badgeBg: 'bg-red-100',
                badgeText: 'text-red-800',
            };
        }
        // Fallback for unknown status
        return {
            emoji: '❓',
            text: 'Unknown Status',
            subtext: dlcStatus || 'Loading...',
            bgColor: 'bg-gray-50',
            textColor: 'text-gray-900',
            borderColor: 'border-gray-200',
            badgeBg: 'bg-gray-100',
            badgeText: 'text-gray-800',
        };
    };
    const status = getStatusDisplay();
    // Size variants
    const sizeClasses = {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-2 text-sm',
        lg: 'px-4 py-3 text-base',
    };
    // Badge variant (small, inline)
    if (variant === 'badge') {
        return (_jsxs("span", { className: `inline-flex items-center gap-1.5 ${sizeClasses[size]} rounded-full ${status.badgeBg} ${status.badgeText} font-medium`, children: [_jsx("span", { children: status.emoji }), _jsx("span", { children: status.text })] }));
    }
    // Inline variant (with subtext)
    if (variant === 'inline') {
        return (_jsxs("div", { className: "flex items-start gap-3", children: [_jsx("span", { className: "text-2xl", children: status.emoji }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "font-medium text-foreground", children: status.text }), _jsx("p", { className: "text-sm text-muted-foreground", children: status.subtext }), deliveryRate && (_jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: ["Current rate: ", Math.round(deliveryRate * 100), "%"] }))] })] }));
    }
    // Card variant (full width)
    return (_jsx("div", { className: `rounded-lg border ${status.borderColor} ${status.bgColor} p-4`, children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("span", { className: "text-3xl", children: status.emoji }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: `font-semibold ${status.textColor}`, children: status.text }), _jsx("p", { className: "text-sm text-muted-foreground mt-1", children: status.subtext }), deliveryRate && (_jsxs("div", { className: "flex items-center gap-2 mt-3", children: [_jsx("div", { className: "flex-1 bg-gray-200 rounded-full h-2 overflow-hidden", children: _jsx("div", { className: `h-full ${dlcStatus === 'approved' ? 'bg-green-500' : dlcStatus === 'shared_brand' ? 'bg-blue-500' : 'bg-yellow-500'}`, style: { width: `${deliveryRate * 100}%` } }) }), _jsxs("span", { className: `text-xs font-medium ${status.textColor}`, children: [Math.round(deliveryRate * 100), "%"] })] }))] })] }) }));
}
//# sourceMappingURL=DeliveryStatusBadge.js.map