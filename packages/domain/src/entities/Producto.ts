// packages/domain/src/entities/Producto.ts
export interface Producto {
  id: string;
  codigo: string;
  nombre: string;
  precioUnitario: number;
  precioConImpuesto: number;
  categoriaId: string | null;
  stockActual: number;
  stockMinimo: number;
  tipoImpuesto: TipoImpuesto;
  activo: boolean;
  businessId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TipoImpuesto = 'IVA15' | 'IVA0' | 'ICE';

export interface ProductoInput {
  codigo: string;
  nombre: string;
  precioUnitario: number;
  categoriaId?: string;
  stockActual: number;
  stockMinimo: number;
  tipoImpuesto: TipoImpuesto;
}