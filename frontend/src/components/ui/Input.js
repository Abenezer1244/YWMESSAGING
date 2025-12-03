import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useId } from 'react';
const Input = React.forwardRef(({ label, error, helperText, icon, iconPosition = 'left', maxLength, showCharCount = false, isPassword = false, className = '', value, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const charCount = typeof value === 'string' ? value.length : 0;
    const inputId = props.id || useId();
    const errorId = useId();
    const helperTextId = useId();
    const baseStyles = 'w-full px-4 py-2.5 bg-input border border-input rounded-sm text-foreground transition-colors duration-normal placeholder:text-muted-foreground/50';
    const focusStyles = 'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:border-primary';
    const errorStyles = error ? 'border-destructive focus:ring-destructive' : '';
    const disabledStyles = 'disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50';
    const combinedInputClassName = `${baseStyles} ${focusStyles} ${errorStyles} ${disabledStyles} ${icon && iconPosition === 'left' ? 'pl-10' : ''} ${icon && iconPosition === 'right' ? 'pr-10' : ''} ${className}`.trim();
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : props.type || 'text';
    return (_jsxs("div", { className: "w-full", children: [label && (_jsxs("label", { htmlFor: inputId, className: "block text-sm font-medium text-foreground mb-2", children: [label, props.required && _jsx("span", { className: "text-destructive ml-1", children: "*" })] })), _jsxs("div", { className: "relative", children: [icon && iconPosition === 'left' && (_jsx("div", { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground flex items-center", children: icon })), _jsx("input", { ref: ref, id: inputId, type: inputType, value: value, maxLength: maxLength, className: combinedInputClassName, "aria-required": props.required, "aria-invalid": !!error, "aria-describedby": error ? errorId : helperText ? helperTextId : undefined, ...props }), isPassword && (_jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), "aria-label": showPassword ? 'Hide password' : 'Show password', className: "absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded p-1", children: showPassword ? '👁️' : '👁️‍🗨️' })), icon && iconPosition === 'right' && !isPassword && (_jsx("div", { className: "absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground flex items-center", children: icon }))] }), showCharCount && maxLength && (_jsxs("div", { className: "text-xs text-muted-foreground mt-1", children: [charCount, " / ", maxLength] })), error && (_jsxs("p", { id: errorId, className: "text-xs text-destructive mt-1.5 flex items-center gap-1", children: [_jsx("span", { children: "\u26A0\uFE0F" }), error] })), helperText && !error && (_jsx("p", { id: helperTextId, className: "text-xs text-muted-foreground mt-1.5", children: helperText }))] }));
});
Input.displayName = 'Input';
export default Input;
//# sourceMappingURL=Input.js.map