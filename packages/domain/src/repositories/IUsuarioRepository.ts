// packages/domain/src/repositories/IUsuarioRepository.ts
import type { Usuario } from '../entities/Usuario';

export interface IUsuarioRepository {
  findById(id: string): Promise<Usuario | null>;
  findByEmail(email: string): Promise<Usuario | null>;
  create(usuario: Usuario): Promise<Usuario>;
}