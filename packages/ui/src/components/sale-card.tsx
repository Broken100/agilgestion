import type { Venta } from '@agilgestion/domain';
import { Card } from './card';
import { StatusBadge } from './status-badge';
import { motion } from 'motion/react';

interface SaleCardProps {
  venta: Pick<Venta, 'numeroFactura' | 'total' | 'estadoSri'> & { clienteNombre?: string | null };
  onClick?: () => void;
  className?: string;
}

export function SaleCard({ venta, onClick, className }: SaleCardProps) {
  return (
    <motion.div whileHover={{ y: -1, transition: { duration: 0.15 } }} whileTap={onClick ? { scale: 0.98 } : undefined}>
      <Card
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        className={`flex items-center justify-between p-3 ${onClick ? 'cursor-pointer hover:bg-muted/50 hover:border-chartwell-blue/30' : ''} ${className ?? ''}`}
      >
        <div className="min-w-0 flex-1">
          <div className="font-heading font-semibold text-foreground truncate">#{venta.numeroFactura}</div>
          <div className="truncate text-sm text-ash-gray dark:text-muted-foreground">{venta.clienteNombre ?? 'Venta libre'}</div>
        </div>
        <div className="text-right ml-3 flex-shrink-0">
          <div className="font-bold text-foreground tabular-nums">${Number(venta.total).toFixed(2)}</div>
          <StatusBadge estado={venta.estadoSri} />
        </div>
      </Card>
    </motion.div>
  );
}