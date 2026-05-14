'use client';

import { ErrorCard } from '@/components/ui/error-card';

export default function ProductosError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorCard
      title="Error en Productos"
      message={error.message || 'Ocurrio un error al cargar los productos.'}
      onRetry={reset}
    />
  );
}
