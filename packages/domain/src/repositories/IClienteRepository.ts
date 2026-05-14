// packages/domain/src/repositories/IClienteRepository.ts
import type { Cliente, ClienteInput } from '../entities/Cliente';

export interface IClienteRepository {
  findById(id: string): Promise<Cliente | null>;
  findByIdentificacion(identificacion: string, businessId: string): Promise<Cliente | null>;
  findByBusiness(businessId: string): Promise<Cliente[]>;
  create(cliente: Cliente): Promise<Cliente>;
}