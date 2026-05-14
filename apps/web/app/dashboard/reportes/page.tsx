'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { DateRange } from 'react-day-picker';
import { subDays } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { StatCard } from '@agilgestion/ui';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DollarSign, CreditCard, Percent, TrendingUp, AlertCircle } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import { toast } from 'sonner';

const SalesCharts = dynamic(() => import('./charts'), {
  ssr: false,
  loading: () => (
    <div className="grid md:grid-cols-2 gap-6">
      <Skeleton className="h-[360px] rounded-lg" />
      <Skeleton className="h-[360px] rounded-lg" />
    </div>
  ),
});

interface VentaDetalle {
  id: string;
  numeroFactura: string;
  fecha: string;
  total: number;
  subtotal: number;
  impuestoTotal: number;
  medioPago: string;
  estadoSri: string;
  clienteNombre?: string;
  lineas: Array<{
    productoNombre: string;
    cantidad: number;
    precioUnitario: number;
    totalLinea: number;
  }>;
}

export default function ReportesPage() {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: subDays(new Date(), 6),
    to: new Date(),
  });

  const [totalVentas, setTotalVentas] = React.useState(0);
  const [totalMonto, setTotalMonto] = React.useState(0);
  const [totalIva, setTotalIva] = React.useState(0);
  const [promedio, setPromedio] = React.useState(0);
  const [sales, setSales] = React.useState<any[]>([]);
  const [chartData, setChartData] = React.useState<any[]>([]);
  const [paymentData, setPaymentData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const [detalleOpen, setDetalleOpen] = React.useState(false);
  const [ventaDetalle, setVentaDetalle] = React.useState<VentaDetalle | null>(null);

  const fetchStats = React.useCallback(async () => {
    if (!date?.from || !date?.to) return;

    setLoading(true);
    setError(false);
    const from = date.from.toISOString();
    const to = date.to.toISOString();

    try {
      const statsRes = await apiFetch(`/api/ventas/stats?from=${from}&to=${to}`);
      const statsData = await statsRes.json();

      const apiData = statsData.data;
      const apiStats = apiData?.stats;
      const apiVentas = apiData?.ventas || [];

      setTotalVentas(apiStats?.totalVentas || 0);
      setTotalMonto(apiStats?.total || 0);
      setTotalIva(apiStats?.ivaRecaudado || 0);
      setPromedio(apiStats?.promedioPorVenta || 0);

      const mappedSales = apiVentas.map((v: any) => ({
        id: v.id,
        numeroFactura: v.numeroFactura,
        fecha: v.fecha,
        total: Number(v.total),
        subtotal: Number(v.subtotal),
        impuestoTotal: Number(v.impuestoTotal),
        medioPago: v.medioPago,
        estadoSri: v.estadoSri,
        fechaCreacion: v.fecha,
      }));
      setSales(mappedSales);

      const grouped = apiVentas.reduce((acc: Record<string, number>, v: any) => {
        const day = new Date(v.fecha).toLocaleDateString('es-EC', { weekday: 'short' });
        acc[day] = (acc[day] || 0) + 1;
        return acc;
      }, {});
      setChartData(
        Object.entries(grouped).map(([date, ventas]) => ({ date, ventas }))
      );

      const byPayment = apiVentas.reduce((acc: Record<string, number>, v: any) => {
        const medio = v.medioPago || 'Otro';
        acc[medio] = (acc[medio] || 0) + Number(v.total);
        return acc;
      }, {});
      setPaymentData(
        Object.entries(byPayment).map(([name, value]) => ({ name, value }))
      );
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [date]);

  React.useEffect(() => {
    fetchStats();
  }, [fetchStats]);

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
    } catch (err) {
      console.error('Failed to load sale detail:', err);
      toast.error('Error al cargar detalle');
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reportes</h1>
          <p className="text-muted-foreground">
            Resumen de ventas y actividad
          </p>
        </div>
        <DateRangePicker date={date} onDateChange={setDate} />
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-10 w-10 text-destructive mb-2" />
          <p className="text-sm text-muted-foreground mb-3">Error al cargar estadisticas</p>
          <Button variant="outline" size="sm" onClick={fetchStats}>
            Reintentar
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Ventas"
            value={totalVentas.toString()}
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <StatCard
            title="Total"
            value={`$${(totalMonto ?? 0).toFixed(2)}`}
            icon={<DollarSign className="h-5 w-5" />}
          />
          <StatCard
            title="IVA Recaudado"
            value={`$${(totalIva ?? 0).toFixed(2)}`}
            icon={<Percent className="h-5 w-5" />}
          />
          <StatCard
            title="Promedio"
            value={`$${(promedio ?? 0).toFixed(2)}`}
            icon={<CreditCard className="h-5 w-5" />}
          />
        </div>
      )}

      {!loading && !error && chartData.length > 0 && (
        <SalesCharts chartData={chartData} paymentData={paymentData} />
      )}

      {!error && (
        <Card>
          <CardHeader>
            <CardTitle>Detalle de Ventas</CardTitle>
            <CardDescription>
              {sales.length} ventas realizadas en el periodo seleccionado
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-md" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto -mx-6 px-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Factura</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Metodo</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sales.map((sale) => (
                      <TableRow
                        key={sale.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSaleClick(sale.id)}
                      >
                        <TableCell className="font-mono text-xs whitespace-nowrap">
                          {sale.numeroFactura}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {new Date(sale.fechaCreacion || sale.fecha).toLocaleDateString('es-EC')}
                        </TableCell>
                        <TableCell className="capitalize whitespace-nowrap">
                          {sale.medioPago?.replace('_', ' ')}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              sale.estadoSri === 'AUTORIZADO'
                                ? 'success'
                                : sale.estadoSri === 'PENDIENTE'
                                ? 'warning'
                                : 'destructive'
                            }
                          >
                            {sale.estadoSri}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium tabular-nums whitespace-nowrap">
                          ${sale.total?.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                    {sales.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                          No hay ventas en este periodo
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

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
                  <p className="font-medium">
                    {new Date(ventaDetalle.fecha).toLocaleString('es-EC')}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Metodo</p>
                  <p className="font-medium capitalize">
                    {ventaDetalle.medioPago?.replace('_', ' ')}
                  </p>
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

              {ventaDetalle.lineas.length > 0 && (
                <div className="border-t pt-3">
                  <p className="text-sm font-medium mb-2">Productos</p>
                  <div className="space-y-2">
                    {ventaDetalle.lineas.map((linea, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <div className="min-w-0">
                          <p className="text-foreground truncate">{linea.productoNombre}</p>
                          <p className="text-xs text-muted-foreground">
                            {linea.cantidad} × ${(linea.precioUnitario ?? 0).toFixed(2)}
                          </p>
                        </div>
                        <span className="font-medium tabular-nums ml-2 flex-shrink-0">
                          ${(linea.totalLinea ?? 0).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t pt-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="tabular-nums">${(ventaDetalle.subtotal ?? 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">IVA</span>
                  <span className="tabular-nums">${(ventaDetalle.impuestoTotal ?? 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span className="tabular-nums text-primary">${(ventaDetalle.total ?? 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}