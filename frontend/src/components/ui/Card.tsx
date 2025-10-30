import React from 'react';

type CardVariant = 'default' | 'highlight' | 'minimal';
type CardPadding = 'sm' | 'md' | 'lg';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  hoverEffect?: boolean;
  border?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({
    variant = 'default',
    padding = 'md',
    hoverEffect = false,
    border = true,
    className = '',
    children,
    ...props
  }, ref) => {

    const baseStyles = 'rounded-md bg-white dark:bg-secondary-800 transition-all duration-normal';

    const variantStyles = {
      default: 'shadow-subtle dark:border dark:border-secondary-700',
      highlight: 'shadow-md border-2 border-primary-100 dark:border-primary-900 bg-gradient-to-br from-white to-primary-50 dark:from-secondary-800 dark:to-secondary-900',
      minimal: 'border border-secondary-200 dark:border-secondary-700',
    };

    const paddingStyles = {
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    };

    const hoverStyles = hoverEffect ? 'hover:shadow-md dark:hover:shadow-lg hover:-translate-y-1 cursor-pointer' : '';
    const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${paddingStyles[padding]} ${hoverStyles} ${className}`.trim();

    return (
      <div ref={ref} className={combinedClassName} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
