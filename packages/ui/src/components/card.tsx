import type { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ children, className, onClick, role, tabIndex, ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-stone-border bg-card text-card-foreground p-4 transition-all dark:border-stone-border ${className ?? ''}`}
      onClick={onClick}
      role={role}
      tabIndex={tabIndex}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`mb-2 ${className ?? ''}`}>{children}</div>;
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h3 className={`font-heading text-lg font-semibold text-foreground ${className ?? ''}`}>{children}</h3>;
}

export function CardContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`text-sm text-muted-foreground ${className ?? ''}`}>{children}</div>;
}