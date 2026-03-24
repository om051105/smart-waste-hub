import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  variant?: 'default' | 'primary' | 'warning' | 'info';
}

const variantStyles = {
  default: 'bg-card shadow-card',
  primary: 'gradient-primary text-primary-foreground',
  warning: 'bg-warning text-warning-foreground',
  info: 'bg-info text-info-foreground',
};

export default function StatCard({ title, value, icon: Icon, trend, variant = 'default' }: StatCardProps) {
  const isPrimary = variant !== 'default';
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl p-5 ${variantStyles[variant]}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-sm font-medium ${isPrimary ? 'opacity-80' : 'text-muted-foreground'}`}>{title}</p>
          <p className="text-3xl font-bold font-display mt-1">{value}</p>
          {trend && <p className={`text-xs mt-2 ${isPrimary ? 'opacity-70' : 'text-muted-foreground'}`}>{trend}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isPrimary ? 'bg-white/20' : 'bg-secondary'}`}>
          <Icon className={`w-5 h-5 ${isPrimary ? '' : 'text-primary'}`} />
        </div>
      </div>
    </motion.div>
  );
}
