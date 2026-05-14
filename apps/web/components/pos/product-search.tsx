'use client';

import { useState, useRef, useEffect } from 'react';
import { apiFetch } from '@/lib/api-client';
import { toast } from 'sonner';
import { Search, Package } from 'lucide-react';

interface ProductSearchProps {
  onProductSelect: (producto: { id: string; codigo: string; nombre: string; precioUnitario: number; tipoImpuesto: string; stockActual: number }) => void;
}

export function ProductSearch({ onProductSelect }: ProductSearchProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Array<{
    id: string;
    codigo: string;
    nombre: string;
    precioUnitario: number;
    tipoImpuesto: string;
    stockActual: number;
  }>>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const searchProducts = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const response = await apiFetch(`/api/productos/buscar?q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          setResults(data.data);
        }
      } catch (error) {
        console.error('Search error:', error);
        toast.error('Error al buscar productos');
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="relative space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por codigo o nombre..."
          className="w-full rounded-md border border-border bg-background px-3 py-2 pl-9 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {loading && (
        <p className="text-xs text-muted-foreground px-1">Buscando...</p>
      )}

      {results.length > 0 && (
        <div className="absolute left-0 right-0 z-50 max-h-64 overflow-auto rounded-md border border-border bg-popover shadow-md">
          {results.map((producto) => (
            <button
              key={producto.id}
              type="button"
              onClick={() => {
                if (producto.stockActual <= 0) return;
                setQuery('');
                setResults([]);
                onProductSelect(producto);
              }}
              className={`flex w-full items-center justify-between px-3 py-2.5 text-left hover:bg-accent transition-colors border-b border-border last:border-b-0 ${producto.stockActual <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Package className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{producto.nombre}</p>
                  <p className="text-xs text-muted-foreground">{producto.codigo}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-sm font-semibold text-foreground tabular-nums ml-2 flex-shrink-0">
                  ${(producto.precioUnitario ?? 0).toFixed(2)}
                </span>
                {producto.stockActual <= 0 ? (
                  <span className="text-[10px] text-red-500 font-medium">Sin stock</span>
                ) : producto.stockActual <= 5 ? (
                  <span className="text-[10px] text-orange-500 font-medium">Stock: {producto.stockActual}</span>
                ) : null}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}