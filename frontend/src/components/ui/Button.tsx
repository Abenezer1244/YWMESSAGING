import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    isLoading = false,
    icon,
    iconPosition = 'left',
    fullWidth = false,
    disabled,
    className = '',
    children,
    ...props
  }, ref) => {

    const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium rounded-sm transition-all duration-normal focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 hover:enabled:scale-105 active:enabled:scale-95';

    const variantStyles = {
      primary: 'bg-primary text-primary-foreground hover:opacity-90 focus-visible:ring-primary active:opacity-75',
      secondary: 'bg-muted text-foreground hover:bg-muted/80 focus-visible:ring-primary active:bg-muted/60',
      outline: 'border-2 border-primary text-primary hover:bg-muted/50 focus-visible:ring-primary active:bg-muted/30',
      ghost: 'text-primary hover:bg-muted/30 focus-visible:ring-primary active:bg-muted/50',
      danger: 'bg-destructive text-destructive-foreground hover:opacity-90 focus-visible:ring-destructive active:opacity-75',
    };

    const sizeStyles = {
      xs: 'px-2 py-1 text-xs min-h-8',
      sm: 'px-3 py-2 text-sm min-h-10',
      md: 'px-4 py-3 text-base min-h-11',
      lg: 'px-6 py-3 text-lg min-h-11',
      xl: 'px-8 py-4 text-lg min-h-12',
    };

    const widthStyle = fullWidth ? 'w-full' : '';
    const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`.trim();

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={combinedClassName}
        {...props}
      >
        {isLoading ? (
          <>
            <div className="spinner-sm" />
            {children && <span>{children}</span>}
          </>
        ) : (
          <>
            {icon && iconPosition === 'left' && <span className="flex items-center">{icon}</span>}
            {children && <span>{children}</span>}
            {icon && iconPosition === 'right' && <span className="flex items-center">{icon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
