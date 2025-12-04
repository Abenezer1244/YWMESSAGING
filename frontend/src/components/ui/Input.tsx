import React, { useState, useId } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  maxLength?: number;
  showCharCount?: boolean;
  isPassword?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    label,
    error,
    helperText,
    icon,
    iconPosition = 'left',
    maxLength,
    showCharCount = false,
    isPassword = false,
    className = '',
    value,
    ...props
  }, ref) => {

    const [showPassword, setShowPassword] = useState(false);
    const charCount = typeof value === 'string' ? value.length : 0;
    const inputId = props.id || useId();
    const errorId = useId();
    const helperTextId = useId();

    const baseStyles = 'w-full px-4 py-3 min-h-11 bg-input border border-input rounded-sm text-foreground transition-colors duration-normal placeholder:text-muted-foreground/50';

    const focusStyles = 'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:border-primary';

    const errorStyles = error ? 'border-destructive focus:ring-destructive' : '';

    const disabledStyles = 'disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50';

    const combinedInputClassName = `${baseStyles} ${focusStyles} ${errorStyles} ${disabledStyles} ${icon && iconPosition === 'left' ? 'pl-10' : ''} ${icon && iconPosition === 'right' ? 'pr-10' : ''} ${className}`.trim();

    const inputType = isPassword ? (showPassword ? 'text' : 'password') : props.type || 'text';

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-foreground mb-2">
            {label}
            {props.required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {icon && iconPosition === 'left' && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground flex items-center">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={inputType}
            value={value}
            maxLength={maxLength}
            className={combinedInputClassName}
            aria-required={props.required}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : helperText ? helperTextId : undefined}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded w-10 h-10 flex items-center justify-center"
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          )}

          {icon && iconPosition === 'right' && !isPassword && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground flex items-center">
              {icon}
            </div>
          )}
        </div>

        {showCharCount && maxLength && (
          <div className="text-xs text-muted-foreground mt-1">
            {charCount} / {maxLength}
          </div>
        )}

        {error && (
          <p id={errorId} className="text-xs text-destructive mt-1.5 flex items-center gap-1">
            <span>⚠️</span>
            {error}
          </p>
        )}

        {helperText && !error && (
          <p id={helperTextId} className="text-xs text-muted-foreground mt-1.5">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
