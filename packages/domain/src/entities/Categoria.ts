// packages/domain/src/entities/Categoria.ts
export interface Categoria {
  id: string;
  businessId: string;
  nombre: string;
  descripcion: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoriaInput {
  nombre: string;
  descripcion?: string;
}