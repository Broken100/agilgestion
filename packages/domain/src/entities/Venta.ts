// packages/domain/src/entities/Venta.ts
import type { EstadoSri, MedioPago } from '../types/enums';

export interface Venta {
  id: string;
  businessId: string;
  numeroFactura: string;
  fecha: Date;
  clienteId: string | null;
  lineas: LineaVenta[];
  subtotal: number;
  descuentoTotal: number;
  impuestoTotal: number;
  total: number;
  estadoSri: EstadoSri;
  claveAcceso: string | null;
  xmlAutorizado: string | null;
  medioPago: MedioPago;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LineaVenta {
  id: string;
  ventaId: string;
  productoId: string;
  productoCodigo: string;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  porcentajeImpuesto: number;
  descuento: number;
  subtotalLinea: number;
  impuestoLinea: number;
  totalLinea: number;
}

export interface LineaVentaInput {
  productoId: string;
  productoCodigo: string;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  porcentajeImpuesto: number;
  descuento?: number;
}

export interface VentaInput {
  clienteId: string | null;
  lineas: LineaVentaInput[];
  medioPago: MedioPago;
}