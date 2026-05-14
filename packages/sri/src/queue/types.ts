// packages/sri/src/queue/types.ts
export type QueueStatus = 'PENDING' | 'SENDING' | 'COMPLETED' | 'FAILED';

export interface QueuedRequest {
  id: string;
  ventaId: string;
  xmlFirmado: string;
  claveAcceso: string;
  attempts: number;
  maxAttempts: number;
  status: QueueStatus;
  createdAt: Date;
  lastAttemptAt: Date | null;
  errorMessage: string | null;
}

export interface ISriOfflineQueue {
  enqueue(ventaId: string, xmlFirmado: string, claveAcceso: string): Promise<void>;
  processQueue(): Promise<void>;
  getStatus(ventaId: string): Promise<QueuedRequest | null>;
}

export interface ISriQueueRepository {
  create(item: QueuedRequest): Promise<void>;
  findByStatus(status: QueueStatus): Promise<QueuedRequest[]>;
  findByVentaId(ventaId: string): Promise<QueuedRequest | null>;
  updateStatus(id: string, status: QueueStatus, errorMessage?: string): Promise<void>;
  incrementAttempt(id: string, errorMessage: string): Promise<void>;
  markCompleted(id: string): Promise<void>;
}