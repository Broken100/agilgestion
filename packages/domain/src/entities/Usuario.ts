// packages/domain/src/entities/Usuario.ts
export interface Usuario {
  id: string;
  businessId: string;
  email: string;
  passwordHash: string;
  nombre: string;
  rol: RolUsuario;
  avatar: string | null;
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

export interface UsuarioUpdate {
  nombre?: string;
  rol?: RolUsuario;
  avatar?: string;
  activo?: boolean;
}

export interface UsuarioPerfilUpdate {
  nombre?: string;
  avatar?: string;
}