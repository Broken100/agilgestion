// packages/infrastructure/src/repositories/NegocioRepository.ts
import type { INegocioRepository } from '@agilgestion/domain';
import type { Negocio, NegocioInput } from '@agilgestion/domain';
import { requireDb } from '../db';
import { businesses } from '../db/schema';
import { eq } from 'drizzle-orm';

export class NegocioRepository implements INegocioRepository {
  async findById(id: string): Promise<Negocio | null> {
    const db = requireDb();
    const result = await db.select().from(businesses).where(eq(businesses.id, id));
    return (result[0] ?? null) as unknown as Negocio | null;
  }

  async findByRuc(ruc: string): Promise<Negocio | null> {
    const db = requireDb();
    const result = await db.select().from(businesses).where(eq(businesses.ruc, ruc));
    return (result[0] ?? null) as unknown as Negocio | null;
  }

  async create(negocio: NegocioInput): Promise<Negocio> {
    const db = requireDb();
    const [created] = await db.insert(businesses).values(negocio as unknown as any).returning();
    return created as unknown as Negocio;
  }

  async update(id: string, data: Partial<NegocioInput>): Promise<Negocio> {
    const db = requireDb();
    const [updated] = await db
      .update(businesses)
      .set(data as unknown as any)
      .where(eq(businesses.id, id))
      .returning();
    return updated as unknown as Negocio;
  }
}