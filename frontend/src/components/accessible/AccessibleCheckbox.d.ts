import React from 'react';
interface AccessibleCheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    /** Label text - required for accessibility */
    label: string;
    /** Helper text displayed below checkbox */
    helperText?: string;
    /** Error message - when present, indicates error state */
    error?: string;
    /** Whether checkbox is required */
    isRequired?: boolean;
    /** Whether checkbox is disabled */
    disabled?: boolean;
    /** Additional aria-label for screen readers */
    ariaLabel?: string;
    /** Whether to display error styling */
    isInvalid?: boolean;
}
/**
 * AccessibleCheckbox Component
 *
 * Provides an accessible checkbox with:
 * - WCAG 2.1 AA compliant labels and associations
 * - Proper keyboard navigation (Space to toggle)
 * - Touch-friendly sizing (44x44px minimum)
 * - Screen reader friendly
 * - High contrast (4.5:1 minimum)
 * - Clear focus indicators
 */
declare const AccessibleCheckbox: React.ForwardRefExoticComponent<AccessibleCheckboxProps & React.RefAttributes<HTMLInputElement>>;
export default AccessibleCheckbox;
//# sourceMappingURL=AccessibleCheckbox.d.ts.map