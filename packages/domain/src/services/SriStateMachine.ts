// packages/domain/src/services/SriStateMachine.ts
import type { EstadoSri } from '../types/enums';
import { TransicionInvalidaError } from '../errors';

type SriTransition =
  | { from: 'PENDIENTE'; to: 'RECIBIDO'; trigger: 'ENVIADO_SRI' }
  | { from: 'RECIBIDO'; to: 'AUTORIZADO'; trigger: 'AUTORIZADO_SRI' }
  | { from: 'RECIBIDO'; to: 'RECHAZADO'; trigger: 'RECHAZADO_SRI' }
  | { from: 'RECHAZADO'; to: 'PENDIENTE'; trigger: 'REENVIO' };

export class SriStateMachine {
  private readonly transitions: SriTransition[] = [
    { from: 'PENDIENTE', to: 'RECIBIDO', trigger: 'ENVIADO_SRI' },
    { from: 'RECIBIDO', to: 'AUTORIZADO', trigger: 'AUTORIZADO_SRI' },
    { from: 'RECIBIDO', to: 'RECHAZADO', trigger: 'RECHAZADO_SRI' },
    { from: 'RECHAZADO', to: 'PENDIENTE', trigger: 'REENVIO' },
  ];

  canTransition(current: EstadoSri, trigger: string): boolean {
    return this.transitions.some(
      (t) => t.from === current && t.trigger === trigger
    );
  }

  next(current: EstadoSri, trigger: string): EstadoSri | null {
    const transition = this.transitions.find(
      (t) => t.from === current && t.trigger === trigger
    );
    return transition?.to ?? null;
  }

  transition(current: EstadoSri, trigger: string): EstadoSri {
    const nextState = this.next(current, trigger);
    if (nextState === null) {
      throw new TransicionInvalidaError(current, trigger);
    }
    return nextState;
  }

  getValidTriggers(current: EstadoSri): string[] {
    return this.transitions
      .filter((t) => t.from === current)
      .map((t) => t.trigger);
  }
}