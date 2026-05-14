// packages/sri/src/queue/SriOfflineQueue.ts
import type { ISriQueueRepository, QueuedRequest } from './types';
import type { SriWebServiceClient } from '../webservice/client';
import type { EstadoSri } from '@agilgestion/domain';

export class SriOfflineQueue {
  constructor(
    private queueDb: ISriQueueRepository,
    private webService: SriWebServiceClient,
    private onStateChange: (ventaId: string, estado: EstadoSri) => void
  ) {}

  async enqueue(ventaId: string, xmlFirmado: string, claveAcceso: string): Promise<void> {
    const existing = await this.queueDb.findByVentaId(ventaId);
    if (existing) return;

    await this.queueDb.create({
      id: crypto.randomUUID(),
      ventaId,
      xmlFirmado,
      claveAcceso,
      attempts: 0,
      maxAttempts: 5,
      status: 'PENDING',
      createdAt: new Date(),
      lastAttemptAt: null,
      errorMessage: null,
    });
  }

  async processQueue(): Promise<void> {
    const pending = await this.queueDb.findByStatus('PENDING');

    for (const item of pending) {
      await this.processItem(item);
    }
  }

  private async processItem(item: QueuedRequest): Promise<void> {
    try {
      await this.queueDb.updateStatus(item.id, 'SENDING');

      const response = await this.webService.enviarRecepcionComprobantes(item.xmlFirmado);

      if (response.estado === 'RECIBIDO') {
        await this.queueDb.markCompleted(item.id);
        this.onStateChange(item.ventaId, 'RECIBIDO');
      } else if (response.estado === 'RECHAZADO') {
        await this.queueDb.updateStatus(item.id, 'FAILED', response.mensajes[0]?.mensaje);
        this.onStateChange(item.ventaId, 'RECHAZADO');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.queueDb.incrementAttempt(item.id, errorMessage);

      if (item.attempts + 1 >= item.maxAttempts) {
        await this.queueDb.updateStatus(item.id, 'FAILED', errorMessage);
      }

      const delay = this.calculateBackoff(item.attempts + 1);
      await this.sleep(delay);
    }
  }

  private calculateBackoff(attempt: number): number {
    return Math.min(1000 * Math.pow(2, attempt - 1), 16000);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async getStatus(ventaId: string): Promise<QueuedRequest | null> {
    return this.queueDb.findByVentaId(ventaId);
  }
}