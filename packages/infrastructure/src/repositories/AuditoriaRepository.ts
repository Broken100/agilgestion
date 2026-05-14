// packages/infrastructure/src/repositories/AuditoriaRepository.ts
import type { IAuditoriaRepository } from '@agilgestion/domain';
import type { EventoAuditoria } from '@agilgestion/domain';
import { requireDb } from '../db';
import { auditLog } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';

export class AuditoriaRepository implements IAuditoriaRepository {
  async log(evento: EventoAuditoria): Promise<void> {
    const db = requireDb();
    await db.insert(auditLog).values({
      id: evento.id,
      businessId: evento.businessId,
      userId: evento.userId,
      tipo: evento.tipo,
      entityType: evento.entityType,
      entityId: evento.entityId,
      metadata: evento.metadata ? JSON.stringify(evento.metadata) : null,
      ipAddress: evento.ipAddress,
      timestamp: evento.timestamp,
    } as any);
  }

  async findByEntity(entityType: string, entityId: string): Promise<EventoAuditoria[]> {
    const db = requireDb();
    const result = await db
      .select()
      .from(auditLog)
      .where(and(eq(auditLog.entityType, entityType), eq(auditLog.entityId, entityId)))
      .orderBy(desc(auditLog.timestamp));
    return result as unknown as EventoAuditoria[];
  }
}