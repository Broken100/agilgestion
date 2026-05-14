'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { StatCard } from '@agilgestion/ui';
import { SaleCard } from '@agilgestion/ui';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DollarSign, CreditCard, TrendingUp, Plus, AlertCircle, AlertTriangle, Package
} from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api-client';
import { motion, AnimatePresence } from 'motion/react';
import { staggerContainer, staggerItem, scaleOnTap } from '@/lib/animation';

interface Producto {
  id: string;
  codigo: string;
  nombre: string;
  precioUnitario: number;
  stockActual: number;
  stockMinimo: number;
  tipoImpuesto: string;
  activo: boolean;
}

interface DailyStats {
  totalVentas: number;
  cantidadTransacciones: number;
  ventasPorMedioPago: Record<string, number>;
  ultimasVentas: Array<{
    id: string;
    numeroFactura: string;
    total: number;
    estadoSri: string;
    clienteNombre?: string;
  }>;
}

interface VentaDetalle {
  id: string;
  numeroFactura: string;
  fecha: string;
  total: number;
  subtotal: number;
  impuestoTotal: number;
  medioPago: string;
  estadoSri: string;
  claveAcceso: string;
  lineas: Array<{
    productoNombre: string;
    cantidad: number;
    precioUnitario: number;
    totalLinea: number;
  }>;
  clienteNombre?: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DailyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loadingProductos, setLoadingProductos] = useState(true);
  const [ventaDetalle, setVentaDetalle] = useState<VentaDetalle | null>(null);
  const [detalleOpen, setDetalleOpen] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiFetch('/api/ventas/daily-stats');
        if (response.ok) {
          const responseData = await response.json();
          setStats(responseData.data);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    const fetchProductos = async () => {
      try {
        const res = await apiFetch('/api/productos');
        if (res.ok) {
          const data = await res.json();
          setProductos(data.data || []);
        }
      } catch {
        console.error('Failed to fetch productos');
      } finally {
        setLoadingProductos(false);
      }
    };

    fetchStats();
    fetchProductos();
  }, []);

  const outOfStock = productos.filter((p) => p.stockActual <= 0 && p.activo);
  const lowStock = productos.filter(
    (p) => p.stockActual > 0 && p.stockActual <= p.stockMinimo && p.activo
  );

  const handleSaleClick = async (ventaId: string) => {
    try {
      const res = await apiFetch(`/api/ventas/${ventaId}`);
      if (res.ok) {
        const data = await res.json();
        setVentaDetalle(data.data);
        setDetalleOpen(true);
      } else {
        toast.error('No se pudo cargar el detalle');
      }
    } catch {
      toast.error('Error al cargar detalle');
    }
  };

  const today = new Date().toLocaleDateString('es-EC', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="flex-1 space-y-4 p-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground capitalize">{today}</p>
        </div>
      </motion.div>

      {(outOfStock.length > 0 || lowStock.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          {outOfStock.length > 0 && (
            <Link href="/dashboard/productos">
              <div className="flex items-center gap-3 rounded-lg border-2 border-red-500/50 bg-red-50/50 dark:bg-red-900/20 p-3 cursor-pointer hover:bg-red-50/70 transition-colors">
                <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                    {outOfStock.length} producto(s) agotado(s)
                  </p>
                  <p className="text-xs text-red-600/70 dark:text-red-400/70 truncate">
                    {outOfStock.slice(0, 3).map((p) => p.nombre).join(', ')}
                    {outOfStock.length > 3 ? ` y ${outOfStock.length - 3} más` : ''}
                  </p>
                </div>
                <Package className="h-4 w-4 text-red-500" />
              </div>
            </Link>
          )}
          {lowStock.length > 0 && (
            <Link href="/dashboard/productos">
              <div className="flex items-center gap-3 rounded-lg border-2 border-orange-500/50 bg-orange-50/50 dark:bg-orange-900/20 p-3 cursor-pointer hover:bg-orange-50/70 transition-colors">
                <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-orange-700 dark:text-orange-400">
                    {lowStock.length} producto(s) con bajo stock
                  </p>
                  <p className="text-xs text-orange-600/70 dark:text-orange-400/70 truncate">
                    {lowStock.slice(0, 3).map((p) => p.nombre).join(', ')}
                    {lowStock.length > 3 ? ` y ${lowStock.length - 3} más` : ''}
                  </p>
                </div>
                <Badge variant="warning" className="text-xs">Ver</Badge>
              </div>
            </Link>
          )}
        </motion.div>
      )}

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full rounded-lg" />
          <div className="grid grid-cols-3 gap-2">
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
          </div>
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      ) : error ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-12 text-center"
        >
          <AlertCircle className="h-10 w-10 text-destructive mb-2" />
          <p className="text-sm text-muted-foreground mb-3">Error al cargar estadisticas</p>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </motion.div>
      ) : (
        <>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            <motion.div variants={staggerItem}>
              <Link href="/dashboard/reportes">
                <div className="cursor-pointer">
                  <StatCard
                    title="Ventas del Dia"
                    value={stats ? `$${stats.totalVentas.toFixed(2)}` : '$0.00'}
                    subtitle={stats ? `${stats.cantidadTransacciones} transacciones` : undefined}
                    icon={<DollarSign className="h-5 w-5" />}
                  />
                </div>
              </Link>
            </motion.div>

            <AnimatePresence>
              {stats && Object.keys(stats.ventasPorMedioPago).length > 0 && (
                <motion.div
                  variants={staggerItem}
                  className={`grid gap-2 ${Object.keys(stats.ventasPorMedioPago).length <= 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'}`}
                >
                  {Object.entries(stats.ventasPorMedioPago).map(([medio, total]) => (
                    <Link key={medio} href="/dashboard/reportes">
                      <div className="cursor-pointer">
                        <StatCard
                          title={medio}
                          value={`$${total.toFixed(2)}`}
                          className="p-3"
                        />
                      </div>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="mb-2 text-sm font-medium text-muted-foreground">Ultimas Ventas</h2>
            <div className="space-y-2">
              {stats?.ultimasVentas.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col items-center justify-center py-8 text-muted-foreground"
                >
                  <DollarSign className="h-10 w-10 mb-2 opacity-20" />
                  <p className="text-sm">No hay ventas hoy</p>
                  <p className="text-xs mt-1">Las ventas del dia apareceran aqui</p>
                </motion.div>
              )}
              <AnimatePresence>
                {stats?.ultimasVentas.map((venta) => (
                  <motion.div
                    key={venta.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    layout
                  >
                    <div
                      className="cursor-pointer"
                      onClick={() => handleSaleClick(venta.id)}
                    >
                      <SaleCard
                        venta={{
                          numeroFactura: venta.numeroFactura,
                          total: venta.total,
                          estadoSri: venta.estadoSri as 'PENDIENTE' | 'RECIBIDO' | 'AUTORIZADO' | 'RECHAZADO',
                          clienteNombre: venta.clienteNombre,
                        }}
                      />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="fixed bottom-[calc(56px+env(safe-area-inset-bottom))] left-4 right-4 z-40"
      >
        <motion.div variants={scaleOnTap} initial="rest" whileTap="tap">
          <Link href="/dashboard/pos">
            <Button size="lg" className="w-full shadow-lg">
              <Plus className="mr-2 h-5 w-5" />
              Nueva Venta
            </Button>
          </Link>
        </motion.div>
      </motion.div>

      <Dialog open={detalleOpen} onOpenChange={setDetalleOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalle de Venta</DialogTitle>
          </DialogHeader>
          {ventaDetalle && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Factura</p>
                  <p className="font-mono font-medium">{ventaDetalle.numeroFactura}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Fecha</p>
                  <p className="font-medium">{new Date(ventaDetalle.fecha).toLocaleString('es-EC')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Método</p>
                  <p className="font-medium capitalize">{ventaDetalle.medioPago?.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Estado SRI</p>
                  <Badge
                    variant={
                      ventaDetalle.estadoSri === 'AUTORIZADO'
                        ? 'success'
                        : ventaDetalle.estadoSri === 'PENDIENTE'
                        ? 'warning'
                        : 'destructive'
                    }
                  >
                    {ventaDetalle.estadoSri}
                  </Badge>
                </div>
              </div>

              <div className="border-t pt-3">
                <p className="text-sm font-medium mb-2">Productos</p>
                <div className="space-y-2">
                  {ventaDetalle.lineas.map((linea, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <div className="min-w-0">
                        <p className="text-foreground truncate">{linea.productoNombre}</p>
                        <p className="text-xs text-muted-foreground">
                          {linea.cantidad} × ${linea.precioUnitario.toFixed(2)}
                        </p>
                      </div>
                      <span className="font-medium tabular-nums ml-2 flex-shrink-0">
                        ${linea.totalLinea.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="tabular-nums">${ventaDetalle.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">IVA</span>
                  <span className="tabular-nums">${ventaDetalle.impuestoTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span className="tabular-nums text-primary">${ventaDetalle.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}