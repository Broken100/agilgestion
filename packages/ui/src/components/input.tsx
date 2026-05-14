import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export function Input({
  error,
  label,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id ?? (label?.toLowerCase().replace(/\s+/g, '-') ?? 'input');

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`flex h-11 w-full rounded-lg border border-platinum-outline bg-background px-3 py-2 text-base text-foreground placeholder:text-ash-gray focus:outline-none focus:ring-2 focus:ring-chartwell-blue focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 dark:border-stone-border ${error ? 'border-destructive focus:ring-destructive' : ''} ${className ?? ''}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
    </div>
  );
}