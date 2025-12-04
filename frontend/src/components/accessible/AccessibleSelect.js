import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef } from 'react';
import { designTokens } from '@/utils/designTokens';
/**
 * AccessibleSelect Component
 *
 * Provides an accessible select dropdown with:
 * - WCAG 2.1 AA compliant labels and associations
 * - Proper keyboard navigation (Arrow keys, Enter)
 * - Screen reader friendly options
 * - Touch-friendly sizing (44x44px minimum)
 * - High contrast (4.5:1 minimum)
 * - Clear focus and disabled states
 */
const AccessibleSelect = forwardRef(({ label, options, helperText, error, placeholder = 'Select an option', isRequired = false, disabled = false, ariaLabel, id, className = '', ...props }, ref) => {
    // Generate a stable ID if not provided
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
    const helperId = `${selectId}-helper`;
    const errorId = `${selectId}-error`;
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
    const selectWrapperStyles = {
        position: 'relative',
        display: 'flex',
        alignItems: 'center'
    };
    const selectStyles = {
        // Sizing (touch target compliant)
        minHeight: designTokens.touchTarget.enhanced,
        width: '100%',
        padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
        paddingRight: `${parseInt(designTokens.spacing.xl) + 32}px`, // Space for arrow
        // Typography
        fontSize: designTokens.typography.fontSize.base,
        fontFamily: designTokens.typography.fontFamily.sans,
        lineHeight: designTokens.typography.lineHeight.normal,
        // Colors (WCAG AA compliant)
        backgroundColor: designTokens.colors.input,
        color: designTokens.colors.foreground,
        borderColor: error ? designTokens.colors.error : designTokens.colors.border,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderRadius: designTokens.borderRadius.base,
        // Interaction
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: `all ${designTokens.transition.fast} ${designTokens.easing.easeOut}`,
        // Accessibility
        outline: 'none'
    };
    const helperTextStyles = {
        fontSize: designTokens.typography.fontSize.xs,
        color: error ? designTokens.colors.error : designTokens.colors['muted-foreground'],
        marginTop: designTokens.spacing.xs,
        display: 'block',
        lineHeight: designTokens.typography.lineHeight.normal
    };
    const arrowStyles = {
        position: 'absolute',
        right: designTokens.spacing.md,
        top: '50%',
        transform: 'translateY(-50%)',
        pointerEvents: 'none',
        color: disabled ? designTokens.colors['muted-foreground'] : designTokens.colors.primary,
        fontSize: '20px'
    };
    return (_jsxs("div", { style: containerStyles, className: className, children: [_jsxs("label", { htmlFor: selectId, style: labelStyles, children: [label, isRequired && (_jsx("span", { "aria-label": "required", style: {
                            color: designTokens.colors.error,
                            marginLeft: designTokens.spacing.xs
                        }, children: "*" }))] }), _jsxs("div", { style: selectWrapperStyles, children: [_jsx("select", { ref: ref, id: selectId, disabled: disabled, "aria-label": ariaLabel, "aria-required": isRequired, "aria-invalid": !!error, "aria-describedby": error ? errorId : helperText ? helperId : undefined, style: selectStyles, onFocus: (e) => {
                            if (!disabled) {
                                e.currentTarget.style.borderColor = error
                                    ? designTokens.colors.error
                                    : designTokens.colors.primary;
                                e.currentTarget.style.boxShadow = error
                                    ? `0 0 0 3px rgba(220, 38, 38, 0.1)`
                                    : `0 0 0 3px rgba(59, 130, 246, 0.1)`;
                                e.currentTarget.style.backgroundColor = designTokens.colors.background;
                            }
                        } }), "\\n            onBlur=", (e) => { }, "\\n              e.currentTarget.style.borderColor = error\\n                ? designTokens.colors.error\\n                : designTokens.colors.border;\\n              e.currentTarget.style.boxShadow = 'none';\\n              e.currentTarget.style.backgroundColor = designTokens.colors.input;\\n            }}\\n            ", ...props, "\\n          >\\n            ", "\\n            ", placeholder && (), "\\n              ", _jsx("option", { value: true }), "\\\"\\\" disabled hidden>\\n                ", placeholder, "\\n              "] }), "\\n            )}\\n\\n            ", "\\n            ", options.map((option) => ()), "\\n              ", _jsx("option", {}), "\\n                key=", `${option.value}`, "\\n                value=", option.value, "\\n                disabled=", option.disabled, "\\n              >\\n                ", option.label, "\\n              "] }));
    n;
});
n;
select > ;
n;
n;
{ /* Custom dropdown arrow */ }
n < span;
style = { arrowStyles };
aria - hidden;
"true\">\n            ▼\n          </span>\n        </div>\n\n        {/* Helper text or error message */}\n        {(error || helperText) && (\n          <span\n            id={error ? errorId : helperId}\n            role={error ? 'alert' : 'status'}\n            style={helperTextStyles}\n          >\n            {error || helperText}\n          </span>\n        )}\n      </div>\n    );\n  }\n);\n\nAccessibleSelect.displayName = 'AccessibleSelect';\n\nexport default AccessibleSelect;\n;
//# sourceMappingURL=AccessibleSelect.js.map