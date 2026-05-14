// packages/domain/src/repositories/IProductoRepository.ts
import type { Producto, ProductoInput } from '../entities/Producto';

export interface IProductoRepository {
  findById(id: string): Promise<Producto | null>;
  findByCodigo(codigo: string, businessId: string): Promise<Producto | null>;
  findByBusiness(businessId: string): Promise<Producto[]>;
  findAvailable(businessId: string, limit?: number, offset?: number): Promise<Producto[]>;
  search(query: string, businessId: string, limit?: number): Promise<Producto[]>;
  create(producto: Producto): Promise<Producto>;
  update(id: string, data: Partial<Producto>): Promise<Producto>;
  decrementStock(productoId: string, cantidad: number): Promise<void>;
}