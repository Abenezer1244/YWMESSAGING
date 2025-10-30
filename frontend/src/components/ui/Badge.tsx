import React from 'react';

type BadgeVariant = 'solid' | 'outline' | 'soft';
type BadgeColor = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
  color?: BadgeColor;
  size?: BadgeSize;
  icon?: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({
  variant = 'solid',
  color = 'primary',
  size = 'md',
  icon,
  className = '',
  children,
  ...props
}) => {

  const baseStyles = 'inline-flex items-center gap-1.5 font-medium rounded-full whitespace-nowrap';

  const sizeStyles = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const colorConfig = {
    primary: {
      solid: 'bg-primary-600 dark:bg-primary-500 text-white',
      outline: 'border-2 border-primary-600 dark:border-primary-400 text-primary-600 dark:text-primary-400 bg-transparent',
      soft: 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-200',
    },
    secondary: {
      solid: 'bg-secondary-600 dark:bg-secondary-500 text-white',
      outline: 'border-2 border-secondary-600 dark:border-secondary-400 text-secondary-600 dark:text-secondary-400 bg-transparent',
      soft: 'bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-200',
    },
    success: {
      solid: 'bg-success-600 dark:bg-success-500 text-white',
      outline: 'border-2 border-success-600 dark:border-success-400 text-success-600 dark:text-success-400 bg-transparent',
      soft: 'bg-success-100 dark:bg-success-900 text-success-700 dark:text-success-200',
    },
    warning: {
      solid: 'bg-warning-600 dark:bg-warning-500 text-white',
      outline: 'border-2 border-warning-600 dark:border-warning-400 text-warning-600 dark:text-warning-400 bg-transparent',
      soft: 'bg-warning-100 dark:bg-warning-900 text-warning-700 dark:text-warning-200',
    },
    danger: {
      solid: 'bg-danger-600 dark:bg-danger-500 text-white',
      outline: 'border-2 border-danger-600 dark:border-danger-400 text-danger-600 dark:text-danger-400 bg-transparent',
      soft: 'bg-danger-100 dark:bg-danger-900 text-danger-700 dark:text-danger-200',
    },
    info: {
      solid: 'bg-info-600 dark:bg-info-500 text-white',
      outline: 'border-2 border-info-600 dark:border-info-400 text-info-600 dark:text-info-400 bg-transparent',
      soft: 'bg-info-100 dark:bg-info-900 text-info-700 dark:text-info-200',
    },
  };

  const colorStyles = colorConfig[color][variant];
  const combinedClassName = `${baseStyles} ${sizeStyles[size]} ${colorStyles} ${className}`.trim();

  return (
    <div className={combinedClassName} {...props}>
      {icon && <span className="flex items-center">{icon}</span>}
      <span>{children}</span>
    </div>
  );
};

Badge.displayName = 'Badge';

export default Badge;
