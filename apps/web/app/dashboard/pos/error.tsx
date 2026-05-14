'use client';

import { ErrorCard } from '@/components/ui/error-card';

export default function POSError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorCard
      title="Error en POS"
      message={error.message || 'Ocurrio un error al cargar el punto de venta.'}
      onRetry={reset}
    />
  );
}
