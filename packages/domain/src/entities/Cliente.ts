// packages/domain/src/entities/Cliente.ts
export interface Cliente {
  id: string;
  businessId: string;
  tipoIdentificacion: '04' | '05' | '06';
  identificacion: string;
  razonSocial: string;
  nombreComercial: string | null;
  direccion: string | null;
  telefono: string | null;
  email: string | null;
  activo: boolean;
  createdAt: Date;
}

export type TipoIdentificacion = '04' | '05' | '06';

export interface ClienteInput {
  tipoIdentificacion: TipoIdentificacion;
  identificacion: string;
  razonSocial: string;
  nombreComercial?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
}