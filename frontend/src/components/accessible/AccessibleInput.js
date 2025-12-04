import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef } from 'react';
import { designTokens } from '@/utils/designTokens';
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
const AccessibleInput = forwardRef(({ label, helperText, error, icon, isRequired = false, disabled = false, ariaLabel, id, placeholder, type = 'text', className = '', ...props }, ref) => {
    // Generate a stable ID if not provided
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const helperId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;
    const containerStyles = {
        display: 'flex',
        flexDirection: 'column',
        gap: designTokens.spacing.sm,
        width: '100%'
    };
    const labelStyles = {
        fontSize: designTokens.typography.fontSize.sm,
        fontWeight: designTokens.typography.fontWeight.medium,
        color: designTokens.colors.foreground,
        marginBottom: designTokens.spacing.xs,
        display: 'block'
    };
    const inputWrapperStyles = {
        display: 'flex',
        alignItems: 'center',
        gap: designTokens.spacing.sm,
        position: 'relative'
    };
    const inputStyles = {
        // Sizing (touch target compliant)
        minHeight: designTokens.touchTarget.enhanced,
        flex: 1,
        padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
        // Typography
        fontSize: designTokens.typography.fontSize.base,
        fontFamily: designTokens.typography.fontFamily.sans,
        lineHeight: designTokens.typography.lineHeight.normal,
        // Colors (WCAG AA compliant)
        backgroundColor: designTokens.colors.input,
        color: designTokens.colors.foreground,
        borderColor: error
            ? designTokens.colors.error
            : designTokens.colors.border,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderRadius: designTokens.borderRadius.base,
        // Placeholder styling
        caretColor: designTokens.colors.primary,
        // Interaction
        transition: `all ${designTokens.transition.fast} ${designTokens.easing.easeOut}`,
        cursor: disabled ? 'not-allowed' : 'text',
        // Accessibility
        outline: 'none'
    };
    const focusStyles = {
        borderColor: error ? designTokens.colors.error : designTokens.colors.primary,
        boxShadow: error
            ? `0 0 0 3px rgba(220, 38, 38, 0.1)`
            : `0 0 0 3px rgba(59, 130, 246, 0.1)`,
        backgroundColor: designTokens.colors.background
    };
    const disabledStyles = {
        backgroundColor: designTokens.colors.muted,
        color: designTokens.colors['muted-foreground'],
        cursor: 'not-allowed',
        opacity: 0.6
    };
    const helperTextStyles = {
        fontSize: designTokens.typography.fontSize.xs,
        color: error ? designTokens.colors.error : designTokens.colors['muted-foreground'],
        marginTop: designTokens.spacing.xs,
        display: 'block',
        lineHeight: designTokens.typography.lineHeight.normal
    };
    const iconStyles = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: disabled ? designTokens.colors['muted-foreground'] : designTokens.colors.primary,
        flexShrink: 0
    };
    return (_jsxs("div", { style: containerStyles, className: className, children: [_jsxs("label", { htmlFor: inputId, style: labelStyles, children: [label, isRequired && (_jsx("span", { "aria-label": "required", style: {
                            color: designTokens.colors.error,
                            marginLeft: designTokens.spacing.xs
                        }, children: "*" }))] }), _jsxs("div", { style: inputWrapperStyles, children: [icon && (_jsx("div", { style: iconStyles, "aria-hidden": "true", children: icon })), _jsx("input", { ref: ref, id: inputId, type: type, disabled: disabled, placeholder: placeholder, "aria-label": ariaLabel, "aria-required": isRequired, "aria-invalid": !!error, "aria-describedby": error ? errorId : helperText ? helperId : undefined, style: {
                            ...inputStyles,
                            ...(disabled ? disabledStyles : {}),
                            // Note: Focus styles are handled with CSS :focus-visible in production
                            // This is a fallback for inline styles
                        }, onFocus: (e) => {
                            if (!disabled) {
                                e.currentTarget.style.borderColor = error
                                    ? designTokens.colors.error
                                    : designTokens.colors.primary;
                                e.currentTarget.style.boxShadow = error
                                    ? `0 0 0 3px rgba(220, 38, 38, 0.1)`
                                    : `0 0 0 3px rgba(59, 130, 246, 0.1)`;
                                e.currentTarget.style.backgroundColor = designTokens.colors.background;
                            }
                        }, onBlur: (e) => {
                            e.currentTarget.style.borderColor = error
                                ? designTokens.colors.error
                                : designTokens.colors.border;
                            e.currentTarget.style.boxShadow = 'none';
                            e.currentTarget.style.backgroundColor = designTokens.colors.input;
                        }, ...props })] }), (error || helperText) && (_jsx("span", { id: error ? errorId : helperId, role: error ? 'alert' : 'status', style: helperTextStyles, children: error || helperText }))] }));
});
AccessibleInput.displayName = 'AccessibleInput';
export default AccessibleInput;
//# sourceMappingURL=AccessibleInput.js.map