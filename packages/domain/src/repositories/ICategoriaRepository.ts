// packages/domain/src/repositories/ICategoriaRepository.ts
import type { Categoria } from '../entities/Categoria';

export interface ICategoriaRepository {
  findById(id: string): Promise<Categoria | null>;
  findByBusiness(businessId: string): Promise<Categoria[]>;
  create(categoria: Categoria): Promise<Categoria>;
  update(id: string, data: Partial<Categoria>): Promise<Categoria>;
  delete(id: string): Promise<void>;
}