// packages/infrastructure/src/repositories/ClienteRepository.ts
import type { IClienteRepository } from '@agilgestion/domain';
import type { Cliente } from '@agilgestion/domain';
import { requireDb } from '../db';
import { clientes } from '../db/schema';
import { eq, and } from 'drizzle-orm';

export class ClienteRepository implements IClienteRepository {
  async findById(id: string): Promise<Cliente | null> {
    const db = requireDb();
    const result = await db.select().from(clientes).where(eq(clientes.id, id));
    return (result[0] ?? null) as unknown as Cliente | null;
  }

  async findByIdentificacion(
    identificacion: string,
    businessId: string
  ): Promise<Cliente | null> {
    const db = requireDb();
    const result = await db
      .select()
      .from(clientes)
      .where(
        and(eq(clientes.identificacion, identificacion), eq(clientes.businessId, businessId))
      );
    return (result[0] ?? null) as unknown as Cliente | null;
  }

  async findByBusiness(businessId: string): Promise<Cliente[]> {
    const db = requireDb();
    return (await db.select().from(clientes).where(eq(clientes.businessId, businessId))) as unknown as Cliente[];
  }

  async create(cliente: Cliente): Promise<Cliente> {
    const db = requireDb();
    const [created] = await db.insert(clientes).values(cliente as unknown as any).returning();
    return created as unknown as Cliente;
  }
}