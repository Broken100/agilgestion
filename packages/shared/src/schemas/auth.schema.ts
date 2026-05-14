// packages/shared/src/schemas/auth.schema.ts
import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type LoginType = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  nombre: z.string().min(1),
  nombreNegocio: z.string().min(1),
  ruc: z.string().length(13),
});

export type RegisterType = z.infer<typeof RegisterSchema>;

export const AuthResponseSchema = z.object({
  token: z.string(),
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    nombre: z.string(),
    rol: z.enum(['OWNER', 'ADMIN', 'CAJERO']),
    businessId: z.string().uuid(),
  }),
});

export type AuthResponseType = z.infer<typeof AuthResponseSchema>;