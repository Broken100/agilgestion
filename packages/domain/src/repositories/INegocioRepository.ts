// packages/domain/src/repositories/INegocioRepository.ts
import type { Negocio, NegocioInput } from '../entities/Negocio';

export interface INegocioRepository {
  findById(id: string): Promise<Negocio | null>;
  findByRuc(ruc: string): Promise<Negocio | null>;
  create(negocio: NegocioInput): Promise<Negocio>;
  update(id: string, data: Partial<NegocioInput>): Promise<Negocio>;
}