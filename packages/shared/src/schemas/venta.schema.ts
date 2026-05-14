// packages/shared/src/schemas/venta.schema.ts
import { z } from 'zod';

export const LineaVentaSchema = z.object({
  productoId: z.string().uuid(),
  productoCodigo: z.string(),
  productoNombre: z.string(),
  cantidad: z.number().int().positive(),
  precioUnitario: z.number().positive(),
  porcentajeImpuesto: z.number().min(0).max(100),
  descuento: z.number().min(0).default(0),
});

export type LineaVentaSchemaType = z.infer<typeof LineaVentaSchema>;

export const VentaSchema = z.object({
  id: z.string().uuid().optional(),
  businessId: z.string().uuid(),
  numeroFactura: z.string().optional(),
  fecha: z.date().optional(),
  clienteId: z.string().uuid().nullable(),
  lineas: z.array(LineaVentaSchema).min(1),
  subtotal: z.number().optional(),
  descuentoTotal: z.number().optional(),
  impuestoTotal: z.number().optional(),
  total: z.number().optional(),
  estadoSri: z.enum(['PENDIENTE', 'RECIBIDO', 'AUTORIZADO', 'RECHAZADO']).default('PENDIENTE'),
  medioPago: z.enum(['EFECTIVO', 'TARJETA_CREDITO', 'TARJETA_DEBITO', 'TRANSFERENCIA', 'CHEQUE']),
  createdBy: z.string().uuid(),
});

export type VentaSchemaType = z.infer<typeof VentaSchema>;

export const CreateVentaSchema = z.object({
  clienteId: z.string().uuid().nullable(),
  lineas: z.array(LineaVentaSchema).min(1),
  medioPago: z.enum(['EFECTIVO', 'TARJETA_CREDITO', 'TARJETA_DEBITO', 'TRANSFERENCIA', 'CHEQUE']),
});

export type CreateVentaType = z.infer<typeof CreateVentaSchema>;