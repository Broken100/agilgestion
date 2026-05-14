import type { ReactNode } from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-muted text-foreground',
  success: 'bg-success/15 text-success dark:bg-success/20 dark:text-success',
  warning: 'bg-warning/15 text-warning dark:bg-warning/20 dark:text-warning',
  error: 'bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive',
  info: 'bg-chartwell-blue/15 text-chartwell-blue dark:bg-chartwell-blue/20 dark:text-chartwell-blue',
};

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${variantClasses[variant]} ${className ?? ''}`}>
      {children}
    </span>
  );
}