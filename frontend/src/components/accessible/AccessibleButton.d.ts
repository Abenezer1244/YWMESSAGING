import React from 'react';
interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /** Button label - required for accessibility */
    label: string;
    /** Visual icon element (optional) */
    icon?: React.ReactNode;
    /** Button variant */
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    /** Button size */
    size?: 'sm' | 'md' | 'lg';
    /** Loading state */
    isLoading?: boolean;
    /** Disabled state */
    disabled?: boolean;
    /** Full width button */
    fullWidth?: boolean;
    /** Additional aria-label for screen readers (auto-generated from label if not provided) */
    ariaLabel?: string;
}
/**
 * AccessibleButton Component
 *
 * Provides an accessible button with:
 * - WCAG 2.1 AA compliant touch targets (44x44px minimum)
 * - Proper keyboard support (Enter, Space)
 * - Screen reader friendly labels
 * - Focus management
 * - High contrast colors (4.5:1 minimum)
 * - Clear disabled states
 */
declare const AccessibleButton: React.ForwardRefExoticComponent<AccessibleButtonProps & React.RefAttributes<HTMLButtonElement>>;
export default AccessibleButton;
//# sourceMappingURL=AccessibleButton.d.ts.map