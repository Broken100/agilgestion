'use client';

import { useEffect, useState } from 'react';
import { usePOSStore } from '@/stores/pos-store';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api-client';
import { Flame } from 'lucide-react';

interface TopProduct {
  productoId: string;
  productoCodigo: string;
  productoNombre: string;
  precioUnitario: number;
  cantidadTotal: number;
  totalVendido: number;
  stockActual: number;
  tipoImpuesto?: string;
}

export function TopSellingProducts() {
  const [products, setProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { addLinea } = usePOSStore();

  useEffect(() => {
    const fetchTopSelling = async () => {
      try {
        const response = await apiFetch('/api/productos/top-selling?limit=8');
        if (response.ok) {
          const { data } = await response.json();
          setProducts(data);
        }
      } catch (error) {
        console.error('Top selling error:', error);
        toast.error('Error al cargar productos populares');
      } finally {
        setLoading(false);
      }
    };

    fetchTopSelling();
  }, []);

  if (loading || products.length === 0) return null;

  return (
    <div className="bg-muted/30">
      <div className="flex items-center gap-2 px-4 py-2 overflow-x-auto scrollbar-hide">
        <Flame className="h-3.5 w-3.5 text-orange-500 flex-shrink-0" />
        <span className="text-xs font-medium text-muted-foreground flex-shrink-0">Populares:</span>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {products.map((product) => (
            <button
              key={product.productoId}
              type="button"
              onClick={() => {
                if (product.stockActual <= 0) {
                  toast.error('Producto sin stock');
                  return;
                }
                addLinea(
                  {
                    id: product.productoId,
                    codigo: product.productoCodigo,
                    nombre: product.productoNombre,
                    precioUnitario: product.precioUnitario,
                    tipoImpuesto: (product.tipoImpuesto || 'IVA15') as 'IVA15' | 'IVA0' | 'ICE',
                  },
                  1
                );
                toast.success(`${product.productoNombre} agregado`);
              }}
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs text-foreground hover:bg-accent hover:border-primary/50 transition-colors whitespace-nowrap flex-shrink-0 ${
                product.stockActual <= 0
                  ? 'border-red-500/50 bg-red-50/30 opacity-60 cursor-not-allowed'
                  : product.stockActual <= 5
                  ? 'border-orange-500/50 bg-orange-50/30'
                  : 'border-border bg-background'
              }`}
            >
              <span className="font-medium truncate max-w-[80px]">{product.productoNombre}</span>
              <span className="text-muted-foreground text-[10px]">×{product.cantidadTotal}</span>
              {product.stockActual <= 0 ? (
                <span className="text-red-500 text-[10px] font-medium">Sin stock</span>
              ) : product.stockActual <= 5 ? (
                <span className="text-orange-500 text-[10px] font-medium">{product.stockActual}</span>
              ) : null}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}