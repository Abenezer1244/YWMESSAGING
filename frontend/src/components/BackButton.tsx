import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './ui/Button';

interface BackButtonProps {
  to?: string;
  className?: string;
  variant?: 'ghost' | 'outline' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

const BackButton: React.FC<BackButtonProps> = ({
  to,
  className = '',
  variant = 'ghost',
  size = 'md',
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <Button
      onClick={handleClick}
      variant={variant}
      size={size}
      className={`inline-flex items-center gap-2 ${className}`}
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 19l-7-7 7-7"
        />
      </svg>
      <span>Back</span>
    </Button>
  );
};

BackButton.displayName = 'BackButton';

export default BackButton;
