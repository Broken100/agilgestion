// packages/infrastructure/src/repositories/CategoriaRepository.ts
import type { ICategoriaRepository } from '@agilgestion/domain';
import type { Categoria } from '@agilgestion/domain';
import { requireDb } from '../db';
import { categorias } from '../db/schema';
import { eq } from 'drizzle-orm';

export class CategoriaRepository implements ICategoriaRepository {
  async findById(id: string): Promise<Categoria | null> {
    const db = requireDb();
    const result = await db.select().from(categorias).where(eq(categorias.id, id));
    return (result[0] as unknown as Categoria) ?? null;
  }

  async findByBusiness(businessId: string): Promise<Categoria[]> {
    const db = requireDb();
    const result = await db.select().from(categorias).where(eq(categorias.businessId, businessId));
    return result as unknown as Categoria[];
  }

  async create(categoria: Categoria): Promise<Categoria> {
    const db = requireDb();
    const [created] = await db.insert(categorias).values({
      id: categoria.id,
      businessId: categoria.businessId,
      nombre: categoria.nombre,
      descripcion: categoria.descripcion,
    } as any).returning();
    return created as unknown as Categoria;
  }

  async update(id: string, data: Partial<Categoria>): Promise<Categoria> {
    const db = requireDb();
    const [updated] = await db
      .update(categorias)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(categorias.id, id))
      .returning();
    return updated as unknown as Categoria;
  }

  async delete(id: string): Promise<void> {
    const db = requireDb();
    await db.delete(categorias).where(eq(categorias.id, id));
  }
}