// packages/shared/src/schemas/producto.schema.ts
import { z } from 'zod';

export const ProductoSchema = z.object({
  id: z.string().uuid().optional(),
  codigo: z.string().min(1).max(50),
  nombre: z.string().min(1).max(200),
  precioUnitario: z.number().positive(),
  categoriaId: z.string().uuid().nullable().optional(),
  stockActual: z.number().int().min(0),
  stockMinimo: z.number().int().min(0),
  tipoImpuesto: z.enum(['IVA15', 'IVA0', 'ICE']),
  activo: z.boolean().default(true),
});

export type ProductoSchemaType = z.infer<typeof ProductoSchema>;

export const CreateProductoSchema = ProductoSchema.omit({ id: true, activo: true }).extend({
  businessId: z.string().uuid(),
});

export type CreateProductoType = z.infer<typeof CreateProductoSchema>;