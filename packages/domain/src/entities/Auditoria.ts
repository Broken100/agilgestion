// packages/domain/src/entities/Auditoria.ts
export interface EventoAuditoria {
  id: string;
  businessId: string;
  userId: string | null;
  tipo: string;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  timestamp: Date;
}