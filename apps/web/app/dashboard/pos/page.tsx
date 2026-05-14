'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePOSStore } from '@/stores/pos-store';
import { ProductSearch } from '@/components/pos/product-search';
import { TopSellingProducts } from '@/components/pos/top-selling';
import { AvailableProducts } from '@/components/pos/available-products';
import { Button } from '@/components/ui/button';
import { QuantityStepper } from '@agilgestion/ui';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { ShoppingCart, Trash2, ChevronDown, Flame, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { scaleOnTap } from '@/lib/animation';

export default function POSPage() {
  const router = useRouter();

  const { lineas, addLinea, removeLinea, updateCantidad, getTotals, status } = usePOSStore();
  const { subtotal, impuesto, total } = getTotals();
  const [stockMap, setStockMap] = useState<Record<string, number>>({});
  const [showPopulares, setShowPopulares] = useState(true);
  const [showDisponibles, setShowDisponibles] = useState(true);

  useEffect(() => {
    const savedPopulares = localStorage.getItem('pos-show-populares');
    const savedDisponibles = localStorage.getItem('pos-show-disponibles');
    if (savedPopulares !== null) setShowPopulares(savedPopulares === 'true');
    if (savedDisponibles !== null) setShowDisponibles(savedDisponibles === 'true');
  }, []);

  const togglePopulares = () => {
    setShowPopulares((prev) => {
      localStorage.setItem('pos-show-populares', String(!prev));
      return !prev;
    });
  };

  const toggleDisponibles = () => {
    setShowDisponibles((prev) => {
      localStorage.setItem('pos-show-disponibles', String(!prev));
      return !prev;
    });
  };

  const handleCobrar = () => {
    if (lineas.length === 0) return;
    router.push('/dashboard/pos/confirmar');
  };

  const handleProductSelect = (producto: {
    id: string;
    codigo: string;
    nombre: string;
    precioUnitario: number;
    tipoImpuesto: string;
    stockActual: number;
  }) => {
    const existingQty = lineas.find((l) => l.productoId === producto.id)?.cantidad ?? 0;
    if (existingQty + 1 > producto.stockActual) {
      toast.error(`Solo hay ${producto.stockActual} unidades disponibles`);
      return;
    }
    setStockMap((prev) => ({ ...prev, [producto.id]: producto.stockActual }));
    addLinea(producto, 1);
    toast.success(`${producto.nombre} agregado`);
  };

  const handleUpdateCantidad = (productoId: string, productoStock: number, newQty: number) => {
    if (newQty > productoStock) {
      toast.error(`Solo hay ${productoStock} unidades disponibles`);
      return;
    }
    updateCantidad(productoId, newQty);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="border-b border-border bg-background p-4"
      >
        <ProductSearch onProductSelect={handleProductSelect} />
      </motion.header>

      <div className="border-b border-border">
        <button
          type="button"
          onClick={togglePopulares}
          className="flex w-full items-center justify-between px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <Flame className="h-3.5 w-3.5 text-orange-500" />
            <span>Populares</span>
          </div>
          <motion.div
            animate={{ rotate: showPopulares ? 0 : -90 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </motion.div>
        </button>
        <AnimatePresence initial={false}>
          {showPopulares && (
            <motion.div
              key="populares"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <TopSellingProducts />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="border-b border-border">
        <button
          type="button"
          onClick={toggleDisponibles}
          className="flex w-full items-center justify-between px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <Package className="h-3.5 w-3.5 text-chartwell-blue" />
            <span>Disponibles</span>
          </div>
          <motion.div
            animate={{ rotate: showDisponibles ? 0 : -90 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </motion.div>
        </button>
        <AnimatePresence initial={false}>
          {showDisponibles && (
            <motion.div
              key="disponibles"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <AvailableProducts />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-1 space-y-3 overflow-auto p-4 pb-[calc(140px+env(safe-area-inset-bottom))]">
        <AnimatePresence mode="popLayout">
          {lineas.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12 text-muted-foreground"
            >
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ShoppingCart className="h-12 w-12 mb-3 opacity-30" />
              </motion.div>
              <p className="text-sm">Agrega productos para comenzar</p>
            </motion.div>
          )}

          {lineas.map((linea) => (
            <motion.div
              key={linea.productoId}
              layout
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: -50, scale: 0.95, transition: { duration: 0.2 } }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <Card className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{linea.productoNombre}</p>
                    <p className="text-sm text-muted-foreground">
                      ${(linea.precioUnitario ?? 0).toFixed(2)} x {linea.cantidad}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 ml-3">
                    <motion.span
                      key={linea.totalLinea}
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="font-bold text-foreground tabular-nums"
                    >
                      ${(linea.totalLinea ?? 0).toFixed(2)}
                    </motion.span>
                    <QuantityStepper
                      value={linea.cantidad}
                      onChange={(newQty) =>
                        handleUpdateCantidad(linea.productoId, stockMap[linea.productoId] ?? Infinity, newQty)
                      }
                      min={1}
                    />
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeLinea(linea.productoId)}
                      className="flex items-center gap-1 text-sm text-destructive hover:underline"
                      aria-label={`Eliminar ${linea.productoNombre}`}
                    >
                      <Trash2 className="h-3 w-3" />
                      Eliminar
                    </motion.button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-[calc(56px+env(safe-area-inset-bottom))] left-0 right-0 border-t border-border bg-background p-4 z-40"
      >
        <div className="mb-3 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal:</span>
            <span className="text-foreground tabular-nums">${(subtotal ?? 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">IVA (15%):</span>
            <span className="text-foreground tabular-nums">${(impuesto ?? 0).toFixed(2)}</span>
          </div>
          <Separator className="my-1" />
          <div className="flex justify-between text-lg font-bold">
            <span className="text-foreground">TOTAL:</span>
            <motion.span
              key={total}
              initial={{ scale: 1.15 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="text-primary tabular-nums"
            >
              ${(total ?? 0).toFixed(2)}
            </motion.span>
          </div>
        </div>

        <motion.div variants={scaleOnTap} initial="rest" whileTap="tap">
          <Button
            size="lg"
            onClick={handleCobrar}
            disabled={lineas.length === 0 || status === 'PROCESSING'}
            className="w-full"
          >
            Cobrar ${(total ?? 0).toFixed(2)}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}