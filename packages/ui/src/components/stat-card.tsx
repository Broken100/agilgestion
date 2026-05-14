import type { ReactNode } from 'react';
import { Card } from './card';
import { motion } from 'motion/react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  className?: string;
}

export function StatCard({ title, value, subtitle, icon, className }: StatCardProps) {
  return (
    <motion.div whileHover={{ y: -2, transition: { duration: 0.2 } }}>
      <Card className={`flex flex-col gap-1 p-4 ${className ?? ''}`}>
        <div className="flex items-center justify-between">
          <span className="text-sm text-ash-gray dark:text-muted-foreground">{title}</span>
          {icon && <span className="text-chartwell-blue">{icon}</span>}
        </div>
        <div className="font-heading text-2xl font-bold text-foreground tabular-nums">{value}</div>
        {subtitle && <div className="text-xs text-ash-gray dark:text-muted-foreground">{subtitle}</div>}
      </Card>
    </motion.div>
  );
}