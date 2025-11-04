import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { SoftCard } from './SoftCard';

interface SoftStatProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  gradient?: string;
  index?: number;
}

export function SoftStat({
  icon: Icon,
  label,
  value,
  change,
  changeType = 'neutral',
  gradient = 'from-blue-500 to-cyan-500',
  index = 0,
}: SoftStatProps) {
  const changeColor =
    changeType === 'positive'
      ? 'text-green-400'
      : changeType === 'negative'
        ? 'text-red-400'
        : 'text-muted-foreground';

  const changeSign = change !== undefined && change > 0 ? '+' : '';

  return (
    <SoftCard variant="gradient" index={index}>
      <div className="flex items-start justify-between mb-4">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className={`bg-gradient-to-br ${gradient} rounded-xl p-3 shadow-lg`}
        >
          <Icon className="w-6 h-6 text-white" />
        </motion.div>
        {change !== undefined && (
          <div className={`text-sm font-bold ${changeColor}`}>
            {changeSign}{change}%
          </div>
        )}
      </div>

      <p className="text-muted-foreground text-sm font-medium mb-2">{label}</p>
      <p className="text-3xl font-bold text-foreground">{value}</p>
    </SoftCard>
  );
}
