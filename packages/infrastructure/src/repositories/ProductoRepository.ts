// packages/infrastructure/src/repositories/ProductoRepository.ts
import type { IProductoRepository } from '@agilgestion/domain';
import type { Producto } from '@agilgestion/domain';
import { requireDb } from '../db';
import { productos, categorias } from '../db/schema';
import { eq, and, gt, ilike, or, sql } from 'drizzle-orm';

export class ProductoRepository implements IProductoRepository {
  private mapProducto(row: any): Producto {
    return {
      ...row,
      precioUnitario: Number(row.precioUnitario),
      precioConImpuesto: Number(row.precioConImpuesto ?? row.precioUnitario),
    } as unknown as Producto;
  }

  async findById(id: string): Promise<Producto | null> {
    const db = requireDb();
    const result = await db.select().from(productos).where(eq(productos.id, id));
    return result[0] ? this.mapProducto(result[0]) : null;
  }

  async findByCodigo(codigo: string, businessId: string): Promise<Producto | null> {
    const db = requireDb();
    const result = await db
      .select()
      .from(productos)
      .where(and(eq(productos.codigo, codigo), eq(productos.businessId, businessId)));
    return result[0] ? this.mapProducto(result[0]) : null;
  }

  async findByBusiness(businessId: string): Promise<Producto[]> {
    const db = requireDb();
    const rows = await db.select().from(productos).where(eq(productos.businessId, businessId));
    return rows.map((row) => this.mapProducto(row));
  }

  async findAvailable(businessId: string, limit = 20, offset = 0): Promise<Producto[]> {
    const db = requireDb();
    const rows = await db
      .select()
      .from(productos)
      .where(
        and(
          eq(productos.businessId, businessId),
          eq(productos.activo, true),
          gt(productos.stockActual, 0)
        )
      )
      .limit(limit)
      .offset(offset);
    return rows.map((row) => this.mapProducto(row));
  }

  async search(query: string, businessId: string, limit = 10): Promise<Producto[]> {
    const db = requireDb();
    const pattern = `%${query}%`;
    const rows = await db
      .select()
      .from(productos)
      .where(
        and(
          eq(productos.businessId, businessId),
          or(
            ilike(productos.codigo, pattern),
            ilike(productos.nombre, pattern)
          )
        )
      )
      .limit(limit);
    return rows.map((row) => this.mapProducto(row));
  }

  async create(producto: Producto): Promise<Producto> {
    const db = requireDb();
    const [created] = await db.insert(productos).values(producto as unknown as any).returning();
    return this.mapProducto(created);
  }

  async update(id: string, data: Partial<Producto>): Promise<Producto> {
    const db = requireDb();
    const [updated] = await db
      .update(productos)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(productos.id, id))
      .returning();
    return this.mapProducto(updated);
  }

  async decrementStock(productoId: string, cantidad: number): Promise<void> {
    const db = requireDb();
    await db.execute(sql`UPDATE productos SET stock_actual = stock_actual - ${cantidad}, updated_at = NOW() WHERE id = ${productoId}`);
  }
}