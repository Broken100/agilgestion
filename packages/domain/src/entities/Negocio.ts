// packages/domain/src/entities/Negocio.ts
export type AmbienteSri = 'PRUEBAS' | 'PRODUCCION';

export interface Negocio {
  id: string;
  nombre: string;
  ruc: string;
  nombreComercial: string | null;
  direccion: string | null;
  telefono: string | null;
  email: string | null;
  ambienteSri: AmbienteSri;
  certificadoPath: string | null;
  certificadoPassword: string | null;
  qrCodePath: string | null;
  createdAt: Date;
}

export interface NegocioInput {
  nombre: string;
  ruc: string;
  nombreComercial?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  ambienteSri?: AmbienteSri;
  qrCodePath?: string;
}