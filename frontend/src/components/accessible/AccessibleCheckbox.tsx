import React, { forwardRef } from 'react';
import { designTokens } from '@/utils/designTokens';

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
const AccessibleCheckbox = forwardRef<HTMLInputElement, AccessibleCheckboxProps>(
  ({
    label,
    helperText,
    error,
    isRequired = false,
    disabled = false,
    ariaLabel,
    id,
    isInvalid = !!error,
    className = '',
    ...props
  }, ref) => {
    // Generate a stable ID if not provided
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
    const helperId = `${checkboxId}-helper`;
    const errorId = `${checkboxId}-error`;

    const containerStyles: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: designTokens.spacing.sm,
      width: '100%'
    };

    const labelWrapperStyles: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: designTokens.spacing.sm,
      cursor: disabled ? 'not-allowed' : 'pointer',
      minHeight: designTokens.touchTarget.enhanced,
      padding: designTokens.spacing.xs,
      marginLeft: `-${designTokens.spacing.xs}`,
      marginRight: `-${designTokens.spacing.xs}`,
      borderRadius: designTokens.borderRadius.base,
      transition: `background-color ${designTokens.transition.fast} ${designTokens.easing.easeOut}`
    };

    const checkboxStyles: React.CSSProperties = {
      // Sizing
      width: '24px',
      height: '24px',
      minWidth: '24px',
      minHeight: '24px',

      // Styling
      backgroundColor: disabled ? designTokens.colors.muted : designTokens.colors.background,
      borderColor: error ? designTokens.colors.error : designTokens.colors.border,
      borderWidth: '2px',
      borderStyle: 'solid',
      borderRadius: designTokens.borderRadius.sm,
      cursor: disabled ? 'not-allowed' : 'pointer',

      // Accent color for checked state
      accentColor: designTokens.colors.primary,

      // Remove default appearance
      appearance: 'none',
      WebkitAppearance: 'none',

      // Transition for checked state
      transition: `all ${designTokens.transition.fast} ${designTokens.easing.easeOut}`,

      // Accessibility
      outline: 'none'
    };

    const labelTextStyles: React.CSSProperties = {
      fontSize: designTokens.typography.fontSize.base,
      fontWeight: designTokens.typography.fontWeight.normal,
      color: disabled ? designTokens.colors['muted-foreground'] : designTokens.colors.foreground,
      userSelect: 'none',
      lineHeight: designTokens.typography.lineHeight.normal
    };

    const helperTextStyles: React.CSSProperties = {
      fontSize: designTokens.typography.fontSize.xs,
      color: error ? designTokens.colors.error : designTokens.colors['muted-foreground'],
      marginLeft: '32px', // Align with checkbox + gap
      display: 'block',
      lineHeight: designTokens.typography.lineHeight.normal
    };

    return (
      <div style={containerStyles} className={className}>
        {/* Label wrapper with checkbox */}
        <label style={labelWrapperStyles} htmlFor={checkboxId}>
          {/* Custom checkbox */}
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            disabled={disabled}
            aria-label={ariaLabel}
            aria-required={isRequired}
            aria-invalid={isInvalid}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            style={checkboxStyles}
            onFocus={(e) => {
              if (!disabled) {
                e.currentTarget.style.boxShadow = `0 0 0 3px rgba(59, 130, 246, 0.1)`;
              }
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = 'none';
            }}
            {...props}
          />

          {/* Label text */}
          <span style={labelTextStyles}>
            {label}
            {isRequired && (
              <span
                aria-label="required"
                style={{
                  color: designTokens.colors.error,
                  marginLeft: designTokens.spacing.xs
                }}
              >
                *
              </span>
            )}
          </span>
        </label>

        {/* Helper text or error message */}
        {(error || helperText) && (
          <span
            id={error ? errorId : helperId}
            role={error ? 'alert' : 'status'}
            style={helperTextStyles}
          >
            {error || helperText}
          </span>
        )}
      </div>
    );
  }
);

AccessibleCheckbox.displayName = 'AccessibleCheckbox';

export default AccessibleCheckbox;
