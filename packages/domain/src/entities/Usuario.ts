// packages/domain/src/entities/Usuario.ts
export interface Usuario {
  id: string;
  businessId: string;
  email: string;
  passwordHash: string;
  nombre: string;
  rol: RolUsuario;
  activo: boolean;
  createdAt: Date;
}

export type RolUsuario = 'OWNER' | 'ADMIN' | 'CAJERO';

export interface UsuarioInput {
  email: string;
  passwordHash: string;
  nombre: string;
  rol?: RolUsuario;
}