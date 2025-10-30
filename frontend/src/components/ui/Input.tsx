import React, { useState } from 'react';

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

    const baseStyles = 'w-full px-4 py-2.5 bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-sm text-secondary-900 dark:text-secondary-50 transition-colors duration-normal placeholder:text-secondary-400 dark:placeholder:text-secondary-500';

    const focusStyles = 'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-secondary-900 focus:border-primary-500';

    const errorStyles = error ? 'border-danger-500 dark:border-danger-500 focus:ring-danger-500' : '';

    const disabledStyles = 'disabled:bg-secondary-100 dark:disabled:bg-secondary-900 disabled:text-secondary-400 disabled:cursor-not-allowed disabled:opacity-50';

    const combinedInputClassName = `${baseStyles} ${focusStyles} ${errorStyles} ${disabledStyles} ${icon && iconPosition === 'left' ? 'pl-10' : ''} ${icon && iconPosition === 'right' ? 'pr-10' : ''} ${className}`.trim();

    const inputType = isPassword ? (showPassword ? 'text' : 'password') : props.type || 'text';

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
            {label}
            {props.required && <span className="text-danger-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {icon && iconPosition === 'left' && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 dark:text-secondary-500 flex items-center">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            type={inputType}
            value={value}
            maxLength={maxLength}
            className={combinedInputClassName}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 dark:text-secondary-500 hover:text-secondary-600 dark:hover:text-secondary-400 transition-colors"
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          )}

          {icon && iconPosition === 'right' && !isPassword && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 dark:text-secondary-500 flex items-center">
              {icon}
            </div>
          )}
        </div>

        {showCharCount && maxLength && (
          <div className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">
            {charCount} / {maxLength}
          </div>
        )}

        {error && (
          <p className="text-xs text-danger-600 dark:text-danger-400 mt-1.5 flex items-center gap-1">
            <span>⚠️</span>
            {error}
          </p>
        )}

        {helperText && !error && (
          <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1.5">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
