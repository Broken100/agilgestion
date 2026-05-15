'use client';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-2xl font-bold">Algo salió mal</h1>
      <p className="text-muted-foreground">{error.message || 'Error desconocido'}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
      >
        Reintentar
      </button>
    </div>
  );
}