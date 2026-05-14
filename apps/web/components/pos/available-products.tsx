'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePOSStore } from '@/stores/pos-store';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api-client';
import { Package } from 'lucide-react';

interface AvailableProduct {
  id: string;
  codigo: string;
  nombre: string;
  precioUnitario: number;
  tipoImpuesto: string;
  stockActual: number;
}

const PAGE_SIZE = 10;

export function AvailableProducts() {
  const [products, setProducts] = useState<AvailableProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { addLinea } = usePOSStore();

  useEffect(() => {
    const fetchAvailable = async () => {
      try {
        const response = await apiFetch(`/api/productos?available=true&limit=${PAGE_SIZE}&offset=0`);
        if (response.ok) {
          const { data } = await response.json();
          setProducts(data);
          setHasMore(data.length >= PAGE_SIZE);
          setOffset(PAGE_SIZE);
        }
      } catch (error) {
        console.error('Available products error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailable();
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const response = await apiFetch(`/api/productos?available=true&limit=${PAGE_SIZE}&offset=${offset}`);
      if (response.ok) {
        const { data } = await response.json();
        setProducts((prev) => [...prev, ...data]);
        setHasMore(data.length >= PAGE_SIZE);
        setOffset((prev) => prev + data.length);
      }
    } catch (error) {
      console.error('Load more products error:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, offset]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const threshold = 50;
    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - threshold) {
      loadMore();
    }
  }, [loadMore]);

  if (loading || products.length === 0) return null;

  return (
    <div className="bg-muted/30">
      <div className="flex items-center gap-2 px-4 py-2 overflow-x-auto scrollbar-hide">
        <Package className="h-3.5 w-3.5 text-chartwell-blue flex-shrink-0" />
        <span className="text-xs font-medium text-muted-foreground flex-shrink-0">Disponibles:</span>
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
        >
          {products.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => {
                const qtyInCart = 0; // we don't check cart qty for available products
                if (product.stockActual <= 0) {
                  toast.error('Producto sin stock');
                  return;
                }
                addLinea(
                  {
                    id: product.id,
                    codigo: product.codigo,
                    nombre: product.nombre,
                    precioUnitario: product.precioUnitario,
                    tipoImpuesto: (product.tipoImpuesto || 'IVA15') as 'IVA15' | 'IVA0' | 'ICE',
                  },
                  1
                );
                toast.success(`${product.nombre} agregado`);
              }}
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs text-foreground hover:bg-accent hover:border-primary/50 transition-colors whitespace-nowrap flex-shrink-0 ${
                product.stockActual <= 0
                  ? 'border-red-500/50 bg-red-50/30 opacity-60 cursor-not-allowed'
                  : product.stockActual <= 5
                  ? 'border-orange-500/50 bg-orange-50/30'
                  : 'border-border bg-background'
              }`}
            >
              <span className="font-medium truncate max-w-[80px]">{product.nombre}</span>
              <span className="text-muted-foreground text-[10px] tabular-nums">
                ${(product.precioUnitario ?? 0).toFixed(2)}
              </span>
              {product.stockActual <= 0 ? (
                <span className="text-red-500 text-[10px] font-medium">Sin stock</span>
              ) : product.stockActual <= 5 ? (
                <span className="text-orange-500 text-[10px] font-medium">{product.stockActual}</span>
              ) : null}
            </button>
          ))}
          {loadingMore && (
            <span className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Cargando...
            </span>
          )}
        </div>
      </div>
    </div>
  );
}