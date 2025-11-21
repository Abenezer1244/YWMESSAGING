import React from 'react';

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
export function DeliveryStatusBadge({
  dlcStatus,
  deliveryRate,
  wantsPremiumDelivery,
  size = 'md',
  variant = 'badge',
}: DeliveryStatusBadgeProps) {
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
    return (
      <span className={`inline-flex items-center gap-1.5 ${sizeClasses[size]} rounded-full ${status.badgeBg} ${status.badgeText} font-medium`}>
        <span>{status.emoji}</span>
        <span>{status.text}</span>
      </span>
    );
  }

  // Inline variant (with subtext)
  if (variant === 'inline') {
    return (
      <div className="flex items-start gap-3">
        <span className="text-2xl">{status.emoji}</span>
        <div className="flex-1">
          <p className="font-medium text-foreground">{status.text}</p>
          <p className="text-sm text-muted-foreground">{status.subtext}</p>
          {deliveryRate && (
            <p className="text-xs text-muted-foreground mt-1">
              Current rate: {Math.round(deliveryRate * 100)}%
            </p>
          )}
        </div>
      </div>
    );
  }

  // Card variant (full width)
  return (
    <div className={`rounded-lg border ${status.borderColor} ${status.bgColor} p-4`}>
      <div className="flex items-start gap-3">
        <span className="text-3xl">{status.emoji}</span>
        <div className="flex-1">
          <p className={`font-semibold ${status.textColor}`}>{status.text}</p>
          <p className="text-sm text-muted-foreground mt-1">{status.subtext}</p>
          {deliveryRate && (
            <div className="flex items-center gap-2 mt-3">
              <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full ${dlcStatus === 'approved' ? 'bg-green-500' : dlcStatus === 'shared_brand' ? 'bg-blue-500' : 'bg-yellow-500'}`}
                  style={{ width: `${deliveryRate * 100}%` }}
                />
              </div>
              <span className={`text-xs font-medium ${status.textColor}`}>{Math.round(deliveryRate * 100)}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
