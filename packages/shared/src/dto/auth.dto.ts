// packages/shared/src/dto/auth.dto.ts
import type { LoginType, RegisterType } from '../schemas/auth.schema';

export interface LoginDTO extends LoginType {}

export interface RegisterDTO extends RegisterType {}

export interface AuthTokenPayload {
  sub: string;
  email: string;
  businessId: string;
  rol: string;
  iat: number;
  exp: number;
}