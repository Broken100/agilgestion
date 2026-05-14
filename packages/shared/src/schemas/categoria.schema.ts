// packages/shared/src/schemas/categoria.schema.ts
import { z } from 'zod';

export const CategoriaSchema = z.object({
  id: z.string().uuid().optional(),
  nombre: z.string().min(1).max(100),
  descripcion: z.string().max(500).nullable().optional(),
});

export type CategoriaSchemaType = z.infer<typeof CategoriaSchema>;

export const CreateCategoriaSchema = CategoriaSchema.omit({ id: true }).extend({
  businessId: z.string().uuid(),
});

export type CreateCategoriaType = z.infer<typeof CreateCategoriaSchema>;

export const UpdateCategoriaSchema = z.object({
  nombre: z.string().min(1).max(100).optional(),
  descripcion: z.string().max(500).nullable().optional(),
});

export type UpdateCategoriaType = z.infer<typeof UpdateCategoriaSchema>;