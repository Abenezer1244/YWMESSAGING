import React from 'react';

type SpinnerSize = 'sm' | 'md' | 'lg';
type SpinnerColor = 'primary' | 'white' | 'secondary';

interface SpinnerProps {
  size?: SpinnerSize;
  color?: SpinnerColor;
  text?: string;
}

const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'primary',
  text,
}) => {

  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const colorStyles = {
    primary: 'border-primary-200 border-t-primary-600 dark:border-primary-700 dark:border-t-primary-400',
    white: 'border-white/30 border-t-white',
    secondary: 'border-secondary-300 border-t-secondary-600 dark:border-secondary-600 dark:border-t-secondary-400',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizeStyles[size]} ${colorStyles[color]} rounded-full border-2 animate-spin`}
      />
      {text && (
        <p className="text-sm text-secondary-600 dark:text-secondary-400">{text}</p>
      )}
    </div>
  );
};

Spinner.displayName = 'Spinner';

export default Spinner;
