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
    primary: 'border-accent-200 border-t-accent-600 dark:border-accent-700 dark:border-t-accent-400',
    white: 'border-white/30 border-t-white',
    secondary: 'border-primary-300 border-t-primary-600 dark:border-primary-600 dark:border-t-primary-400',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizeStyles[size]} ${colorStyles[color]} rounded-full border-2 animate-spin`}
      />
      {text && (
        <p className="text-sm text-primary-600 dark:text-primary-400">{text}</p>
      )}
    </div>
  );
};

Spinner.displayName = 'Spinner';

export default Spinner;
