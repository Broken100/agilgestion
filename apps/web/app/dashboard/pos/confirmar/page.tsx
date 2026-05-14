'use client';

import { useState, useEffect } from 'react';
import { usePOSStore } from '@/stores/pos-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import type { MedioPago } from '@agilgestion/domain';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api-client';
import { ArrowLeft, CheckCircle, CreditCard, Banknote, Building2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { motion, AnimatePresence } from 'motion/react';
import { staggerContainer, staggerItem, scaleOnTap, successCelebration } from '@/lib/animation';

const metodosPago: { value: MedioPago; label: string; icon: React.ReactNode }[] = [
  { value: 'EFECTIVO', label: 'Efectivo', icon: <Banknote className="h-5 w-5" /> },
  { value: 'TARJETA_CREDITO', label: 'Tarjeta Credito', icon: <CreditCard className="h-5 w-5" /> },
  { value: 'TARJETA_DEBITO', label: 'Tarjeta Debito', icon: <CreditCard className="h-5 w-5" /> },
  { value: 'TRANSFERENCIA', label: 'Transferencia', icon: <Building2 className="h-5 w-5" /> },
];

export default function ConfirmarPagoPage() {
  const [metodoPago, setMetodoPago] = useState<MedioPago | null>(null);
  const [loading, setLoading] = useState(false);
  const [montoRecibido, setMontoRecibido] = useState('');
  const [qrCodePath, setQrCodePath] = useState<string | null>(null);
  const router = useRouter();

  const { lineas, getTotals, lastVenta, status, procesarVenta, clearSale } = usePOSStore();
  const { subtotal, impuesto, total } = getTotals();

  useEffect(() => {
    if (status !== 'SUCCESS' && lineas.length === 0) {
      router.replace('/dashboard/pos');
    }
  }, [lineas, status, router]);

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const res = await apiFetch('/api/admin/negocio');
        if (res.ok) {
          const data = await res.json();
          setQrCodePath(data.data.qrCodePath || null);
        }
      } catch {
        // Silently fail — QR is optional
      }
    };
    fetchBusiness();
  }, []);

  const cambio = metodoPago === 'EFECTIVO' && montoRecibido
    ? Math.max(0, parseFloat(montoRecibido) - total)
    : 0;

  const canConfirm = metodoPago
    ? metodoPago === 'EFECTIVO'
      ? parseFloat(montoRecibido) >= total
      : true
    : false;

  const handleConfirmar = async () => {
    if (!metodoPago) return;
    setLoading(true);
    try {
      await procesarVenta(metodoPago);
      toast.success('Venta registrada exitosamente');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al procesar');
    } finally {
      setLoading(false);
    }
  };

  if (lastVenta && status === 'SUCCESS') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={successCelebration}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900"
          >
            <motion.div
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <CheckCircle className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
            </motion.div>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl font-bold text-foreground"
          >
            Venta registrada!
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-2 text-sm text-muted-foreground"
          >
            Factura #{lastVenta.numeroFactura}
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-1 text-sm text-muted-foreground"
          >
            Estado SRI: {lastVenta.estadoSri}
          </motion.p>
          <motion.p
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, type: 'spring', stiffness: 300 }}
            className="mt-4 text-3xl font-bold text-primary tabular-nums"
          >
            ${total.toFixed(2)}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            variants={scaleOnTap}
          >
            <Button onClick={() => { clearSale(); router.push('/dashboard/pos'); }} className="mt-6 w-full" size="lg">
              Nueva Venta
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-3 border-b border-border bg-background p-4"
      >
        <motion.button
          whileTap={{ scale: 0.9 }}
          type="button"
          onClick={() => router.back()}
          aria-label="Volver"
        >
          <ArrowLeft className="h-5 w-5" />
        </motion.button>
        <h1 className="text-lg font-bold text-foreground">Confirmar Pago</h1>
      </motion.header>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="flex-1 space-y-4 p-4"
      >
        <motion.div variants={staggerItem}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{lineas.length} producto(s)</span>
                <span className="text-foreground tabular-nums">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">IVA</span>
                <span className="text-foreground tabular-nums">${impuesto.toFixed(2)}</span>
              </div>
              <Separator className="my-1" />
              <div className="flex justify-between text-lg font-bold">
                <span className="text-foreground">Total</span>
                <span className="text-primary tabular-nums">${total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem} className="space-y-2">
          <Label className="text-sm font-medium">Metodo de pago</Label>
          <RadioGroup value={metodoPago} onValueChange={(v) => setMetodoPago(v as MedioPago)}>
            {metodosPago.map((metodo) => (
              <motion.div
                key={metodo.value}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-3"
              >
                <RadioGroupItem value={metodo.value} id={metodo.value} />
                <Label
                  htmlFor={metodo.value}
                  className="flex flex-1 items-center gap-3 rounded-lg border border-border p-4 cursor-pointer hover:bg-muted transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                >
                  {metodo.icon}
                  <span className="font-medium">{metodo.label}</span>
                </Label>
              </motion.div>
            ))}
          </RadioGroup>
        </motion.div>

        <AnimatePresence>
          {metodoPago === 'EFECTIVO' && (
            <motion.div
              key="efectivo"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardContent className="pt-4 space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="montoRecibido">Monto recibido</Label>
                    <Input
                      id="montoRecibido"
                      type="number"
                      step="0.01"
                      value={montoRecibido}
                      onChange={(e) => setMontoRecibido(e.target.value)}
                      placeholder="0.00"
                      autoFocus
                    />
                  </div>
                  <AnimatePresence>
                    {montoRecibido && parseFloat(montoRecibido) >= total && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex justify-between text-lg font-bold"
                      >
                        <span className="text-muted-foreground">Cambio:</span>
                        <motion.span
                          key={cambio}
                          initial={{ scale: 1.1 }}
                          animate={{ scale: 1 }}
                          className="text-emerald-600 tabular-nums"
                        >
                          ${cambio.toFixed(2)}
                        </motion.span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {metodoPago === 'TRANSFERENCIA' && (
            <motion.div
              key="transferencia"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardContent className="pt-4 space-y-3">
                  {qrCodePath ? (
                    <div className="flex flex-col items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={qrCodePath}
                        alt="Codigo QR para transferencia"
                        className="h-48 w-48 rounded-lg border border-border object-contain bg-white"
                      />
                      <p className="text-sm text-muted-foreground text-center">
                        Escanea el codigo QR para realizar la transferencia
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-4">
                      <Building2 className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground text-center">
                        El negocio no ha configurado un codigo QR para transferencias
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="fixed bottom-[56px] left-0 right-0 p-4"
      >
        <motion.div variants={scaleOnTap} initial="rest" whileTap="tap">
          <Button
            size="lg"
            onClick={handleConfirmar}
            loading={loading}
            disabled={loading || !canConfirm}
            className="w-full"
          >
            Confirmar Venta
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
