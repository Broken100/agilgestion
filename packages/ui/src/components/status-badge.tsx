import type { EstadoSri } from '@agilgestion/domain';
import { Badge } from './badge';

interface StatusBadgeProps {
  estado: EstadoSri;
}

const statusConfig: Record<EstadoSri, { label: string; variant: 'default' | 'success' | 'warning' | 'error' | 'info' }> = {
  PENDIENTE: { label: 'Pendiente', variant: 'warning' },
  RECIBIDO: { label: 'Recibido', variant: 'info' },
  AUTORIZADO: { label: 'Autorizado', variant: 'success' },
  RECHAZADO: { label: 'Rechazado', variant: 'error' },
};

export function StatusBadge({ estado }: StatusBadgeProps) {
  return <Badge variant={statusConfig[estado]!.variant}>{statusConfig[estado]!.label}</Badge>;
}