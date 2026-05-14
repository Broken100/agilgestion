// packages/shared/src/schemas/cliente.schema.ts
import { z } from 'zod';

export const ClienteSchema = z.object({
  id: z.string().uuid().optional(),
  businessId: z.string().uuid().optional(),
  tipoIdentificacion: z.enum(['04', '05', '06']),
  identificacion: z.string().min(10).max(13),
  razonSocial: z.string().min(1).max(200),
  nombreComercial: z.string().max(200).nullable().optional(),
  direccion: z.string().max(300).nullable().optional(),
  telefono: z.string().max(20).nullable().optional(),
  email: z.string().email().nullable().optional(),
  activo: z.boolean().default(true),
});

export type ClienteSchemaType = z.infer<typeof ClienteSchema>;

export const CreateClienteSchema = ClienteSchema.omit({ id: true, activo: true }).extend({
  businessId: z.string().uuid(),
});

export type CreateClienteType = z.infer<typeof CreateClienteSchema>;