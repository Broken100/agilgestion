'use client';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-xl font-bold">Algo salió mal</h1>
      <p className="text-sm text-muted-foreground">{error.message || 'Error desconocido'}</p>
      <button
        onClick={reset}
        className="px-4 py-2 text-sm border rounded-md"
      >
        Reintentar
      </button>
    </div>
  );
}