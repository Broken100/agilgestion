'use client';

import { ErrorCard } from '@/components/ui/error-card';

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorCard
      title="Error de autenticacion"
      message={error.message || 'Ocurrio un error al cargar la pagina.'}
      onRetry={reset}
    />
  );
}
