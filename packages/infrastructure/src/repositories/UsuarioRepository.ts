// packages/infrastructure/src/repositories/UsuarioRepository.ts
import type { IUsuarioRepository } from '@agilgestion/domain';
import type { Usuario, UsuarioUpdate } from '@agilgestion/domain';
import { requireDb } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

export class UsuarioRepository implements IUsuarioRepository {
  async findById(id: string): Promise<Usuario | null> {
    const db = requireDb();
    const result = await db.select().from(users).where(eq(users.id, id));
    return (result[0] ?? null) as unknown as Usuario | null;
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    const db = requireDb();
    const result = await db.select().from(users).where(eq(users.email, email));
    return (result[0] ?? null) as unknown as Usuario | null;
  }

  async create(usuario: Usuario): Promise<Usuario> {
    const db = requireDb();
    const [created] = await db.insert(users).values(usuario as unknown as any).returning();
    return created as unknown as Usuario;
  }

  async update(id: string, data: Partial<UsuarioUpdate>): Promise<Usuario> {
    const db = requireDb();
    const [updated] = await db
      .update(users)
      .set(data as unknown as any)
      .where(eq(users.id, id))
      .returning();
    return updated as unknown as Usuario;
  }
}