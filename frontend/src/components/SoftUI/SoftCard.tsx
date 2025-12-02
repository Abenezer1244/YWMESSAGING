import { motion } from 'framer-motion';
import { ReactNode, memo } from 'react';

interface SoftCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'gradient' | 'transparent';
  hover?: boolean;
  onClick?: () => void;
  index?: number;
}

function SoftCardComponent({
  children,
  className = '',
  variant = 'default',
  hover = true,
  onClick,
  index = 0,
}: SoftCardProps) {
  const baseClasses =
    'rounded-2xl p-6 transition-all duration-300 border border-border/40';

  const variants = {
    default: 'bg-card/60 backdrop-blur-md shadow-lg',
    gradient: 'bg-gradient-to-br from-primary/20 to-cyan-500/20 backdrop-blur-md shadow-lg',
    transparent: 'bg-card/30 backdrop-blur-sm shadow-sm',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={
        hover
          ? { y: -4, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.15)' }
          : {}
      }
      onClick={onClick}
      className={`${baseClasses} ${variants[variant]} ${className} ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      {children}
    </motion.div>
  );
}

/**
 * Memoized SoftCard component
 * Prevents re-renders when parent component updates but props remain the same
 * Shallow comparison of children, className, variant, hover, onClick, and index
 */
export const SoftCard = memo(SoftCardComponent);
