import React from 'react';
interface AccessibleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    /** Label text - required for accessibility */
    label: string;
    /** Helper text displayed below input */
    helperText?: string;
    /** Error message - when present, indicates error state */
    error?: string;
    /** Input icon (leading element) */
    icon?: React.ReactNode;
    /** Whether input is required */
    isRequired?: boolean;
    /** Whether input is disabled */
    disabled?: boolean;
    /** Additional aria-label for screen readers */
    ariaLabel?: string;
}
/**
 * AccessibleInput Component
 *
 * Provides an accessible text input with:
 * - WCAG 2.1 AA compliant labels and associations
 * - Proper error messaging and validation
 * - Screen reader friendly helper text
 * - Focus management and indicators
 * - High contrast (4.5:1 minimum)
 * - Touch-friendly sizing (44x44px minimum)
 */
declare const AccessibleInput: React.ForwardRefExoticComponent<AccessibleInputProps & React.RefAttributes<HTMLInputElement>>;
export default AccessibleInput;
//# sourceMappingURL=AccessibleInput.d.ts.map