import { motion } from 'framer-motion';
import Button from '../ui/Button';

interface FeaturedCardProps {
  title: string;
  description: string;
  gradient: string;
  imageSrc?: string;
  imageAlt?: string;
  actionLabel?: string;
  onAction?: () => void;
  isDark?: boolean;
  index?: number;
}

export function FeaturedCard({
  title,
  description,
  gradient,
  imageSrc,
  imageAlt,
  actionLabel,
  onAction,
  isDark = false,
  index = 0,
}: FeaturedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.15, duration: 0.4 }}
      whileHover={{ y: -8, boxShadow: '0 30px 60px rgba(0,0,0,0.15)' }}
      className={`relative overflow-hidden rounded-3xl p-8 min-h-80 flex flex-col justify-between ${gradient} shadow-lg hover:shadow-2xl transition-all duration-300`}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <h3 className={`text-3xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-800'}`}>
          {title}
        </h3>
        <p className={`text-lg leading-relaxed ${isDark ? 'text-slate-100' : 'text-slate-700'}`}>
          {description}
        </p>
      </div>

      {/* Image + Action */}
      <div className="relative z-10 flex items-end justify-between">
        {imageSrc && (
          <img
            src={imageSrc}
            alt={imageAlt || title}
            className="w-32 h-32 object-cover opacity-80 hover:opacity-100 transition-opacity"
          />
        )}
        {actionLabel && (
          <Button
            variant="primary"
            size="sm"
            onClick={onAction}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/20"
          >
            {actionLabel} →
          </Button>
        )}
      </div>
    </motion.div>
  );
}
