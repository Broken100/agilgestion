'use client';

import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface ErrorCardProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  fullScreen?: boolean;
}

export function ErrorCard({
  title = 'Algo salio mal',
  message,
  onRetry,
  fullScreen = false,
}: ErrorCardProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 text-center p-4 ${fullScreen ? 'min-h-screen' : 'min-h-[60vh]'}`}>
      <AlertCircle className="h-10 w-10 text-destructive" />
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground max-w-sm">
        {message || 'Ocurrio un error inesperado. Intenta de nuevo.'}
      </p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Reintentar
        </Button>
      )}
    </div>
  );
}
