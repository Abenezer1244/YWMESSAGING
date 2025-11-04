import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  index?: number;
}

export function ChartCard({ title, subtitle, children, index = 0 }: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
      className="bg-card border border-border rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300"
    >
      <div className="mb-6">
        <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="overflow-x-auto">
        {children}
      </div>
    </motion.div>
  );
}
