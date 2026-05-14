import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { LineaVentaInput } from '@agilgestion/domain';
import type { MedioPago } from '@agilgestion/domain';
import { apiFetch } from '@/lib/api-client';

interface ProductoPOS {
  id: string;
  codigo: string;
  nombre: string;
  precioUnitario: number;
  tipoImpuesto: string;
  stockActual?: number;
}

interface LineaCarrito extends LineaVentaInput {
  id: string;
  subtotalLinea: number;
  impuestoLinea: number;
  totalLinea: number;
}

interface POSState {
  lineas: LineaCarrito[];
  clienteId: string | null;
  status: 'IDLE' | 'PROCESSING' | 'SUCCESS' | 'ERROR';
  lastVenta: { id: string; numeroFactura: string; total: number; estadoSri: string } | null;
  error: string | null;

  addLinea: (producto: ProductoPOS, cantidad: number) => void;
  removeLinea: (productoId: string) => void;
  updateCantidad: (productoId: string, cantidad: number) => void;
  clearSale: () => void;
  setClienteId: (clienteId: string | null) => void;
  procesarVenta: (medioPago: MedioPago) => Promise<void>;
  getTotals: () => { subtotal: number; impuesto: number; total: number };
}

const calculateLineTotals = (producto: ProductoPOS, cantidad: number, existingLinea?: LineaCarrito): LineaCarrito => {
  const qty = existingLinea ? existingLinea.cantidad + cantidad : cantidad;
  const precioUnitario = producto.precioUnitario;
  const porcentajeImpuesto = producto.tipoImpuesto === 'IVA15' ? 15 : producto.tipoImpuesto === 'ICE' ? 10 : 0;

  const subtotalLinea = qty * precioUnitario;
  const impuestoLinea = subtotalLinea * (porcentajeImpuesto / 100);
  const totalLinea = subtotalLinea + impuestoLinea;

  return {
    id: existingLinea?.id ?? crypto.randomUUID(),
    productoId: producto.id,
    productoCodigo: producto.codigo,
    productoNombre: producto.nombre,
    cantidad: qty,
    precioUnitario,
    porcentajeImpuesto,
    descuento: 0,
    subtotalLinea,
    impuestoLinea,
    totalLinea,
  };
};

export const usePOSStore = create<POSState>()(
  persist(
    (set, get) => ({
      lineas: [],
      clienteId: null,
      status: 'IDLE',
      lastVenta: null,
      error: null,

      addLinea: (producto, cantidad) => {
        set((state) => {
          const existing = state.lineas.find((l) => l.productoId === producto.id);
          if (existing) {
            return {
              lineas: state.lineas.map((l) =>
                l.productoId === producto.id
                  ? calculateLineTotals(producto, cantidad, l)
                  : l
              ),
            };
          }
          return {
            lineas: [...state.lineas, calculateLineTotals(producto, cantidad)],
          };
        });
      },

      removeLinea: (productoId) => {
        set((state) => ({
          lineas: state.lineas.filter((l) => l.productoId !== productoId),
        }));
      },

      updateCantidad: (productoId, cantidad) => {
        set((state) => {
          if (cantidad <= 0) {
            return { lineas: state.lineas.filter((l) => l.productoId !== productoId) };
          }
          return {
            lineas: state.lineas.map((l) => {
              if (l.productoId !== productoId) return l;
              const subtotalLinea = cantidad * l.precioUnitario;
              const impuestoLinea = subtotalLinea * (l.porcentajeImpuesto / 100);
              const totalLinea = subtotalLinea + impuestoLinea;
              return { ...l, cantidad, subtotalLinea, impuestoLinea, totalLinea };
            }),
          };
        });
      },

      clearSale: () => {
        set({ lineas: [], clienteId: null, status: 'IDLE', lastVenta: null, error: null });
      },

      setClienteId: (clienteId) => {
        set({ clienteId });
      },

      procesarVenta: async (medioPago) => {
        set({ status: 'PROCESSING', error: null });
        try {
          const state = get();
          const response = await apiFetch('/api/ventas', {
            method: 'POST',
            body: JSON.stringify({
              lineas: state.lineas,
              clienteId: state.clienteId,
              medioPago,
            }),
          });

          if (!response.ok) {
            throw new Error('Error al procesar la venta');
          }

          const data = await response.json();
          set({
            status: 'SUCCESS',
            lastVenta: data,
            lineas: [],
            clienteId: null,
          });
        } catch (error) {
          set({
            status: 'ERROR',
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          throw error;
        }
      },

      getTotals: () => {
        const state = get();
        const subtotal = state.lineas.reduce((sum, l) => sum + l.subtotalLinea, 0);
        const impuesto = state.lineas.reduce((sum, l) => sum + l.impuestoLinea, 0);
        const total = state.lineas.reduce((sum, l) => sum + l.totalLinea, 0);
        return { subtotal, impuesto, total };
      },
    }),
    {
      name: 'pos-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);