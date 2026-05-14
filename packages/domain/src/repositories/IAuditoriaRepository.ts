// packages/domain/src/repositories/IAuditoriaRepository.ts
import type { EventoAuditoria } from '../entities/Auditoria';

export interface IAuditoriaRepository {
  log(evento: EventoAuditoria): Promise<void>;
  findByEntity(entityType: string, entityId: string): Promise<EventoAuditoria[]>;
}