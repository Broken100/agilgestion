// packages/domain/tests/smoke.test.ts
import { describe, it, expect } from 'vitest';
import { CalculoSriService } from '../src/services/CalculoSriService';
import { SriStateMachine } from '../src/services/SriStateMachine';

describe('Domain Smoke Tests', () => {
  describe('CalculoSriService', () => {
    const service = new CalculoSriService();

    it('calcularIVA: 100 * IVA15 = 15', () => {
      expect(service.calcularIVA(100, 'IVA15')).toBe(15);
    });

    it('calcularIVA: 100 * IVA0 = 0', () => {
      expect(service.calcularIVA(100, 'IVA0')).toBe(0);
    });

    it('calcularIVA: 100 * ICE = 10', () => {
      expect(service.calcularIVA(100, 'ICE')).toBe(10);
    });

    it('generarClaveAcceso returns digits and has correct format', () => {
      const clave = service.generarClaveAcceso(
        new Date('2026-05-13'),
        'FACTURA',
        '1791234567001',
        '00000001',
        'PRUEBAS'
      );
      expect(clave.length).toBeGreaterThanOrEqual(48);
      expect(clave.length).toBeLessThanOrEqual(50);
      expect(clave.substring(8, 10)).toBe('01');
    });
  });

  describe('SriStateMachine', () => {
    const sm = new SriStateMachine();

    it('PENDIENTE -> ENVIADO_SRI -> RECIBIDO', () => {
      expect(sm.canTransition('PENDIENTE', 'ENVIADO_SRI')).toBe(true);
      expect(sm.next('PENDIENTE', 'ENVIADO_SRI')).toBe('RECIBIDO');
    });

    it('RECIBIDO -> AUTORIZADO_SRI -> AUTORIZADO', () => {
      expect(sm.canTransition('RECIBIDO', 'AUTORIZADO_SRI')).toBe(true);
      expect(sm.next('RECIBIDO', 'AUTORIZADO_SRI')).toBe('AUTORIZADO');
    });

    it('RECIBIDO -> RECHAZADO_SRI -> RECHAZADO', () => {
      expect(sm.canTransition('RECIBIDO', 'RECHAZADO_SRI')).toBe(true);
      expect(sm.next('RECIBIDO', 'RECHAZADO_SRI')).toBe('RECHAZADO');
    });

    it('PENDIENTE -> RECHAZADO_SRI is invalid', () => {
      expect(sm.canTransition('PENDIENTE', 'RECHAZADO_SRI')).toBe(false);
      expect(sm.next('PENDIENTE', 'RECHAZADO_SRI')).toBeNull();
    });

    it('RECHAZADO -> REENVIO -> PENDIENTE', () => {
      expect(sm.canTransition('RECHAZADO', 'REENVIO')).toBe(true);
      expect(sm.next('RECHAZADO', 'REENVIO')).toBe('PENDIENTE');
    });

    it('getValidTriggers for RECIBIDO returns AUTORIZADO_SRI and RECHAZADO_SRI', () => {
      const triggers = sm.getValidTriggers('RECIBIDO');
      expect(triggers).toContain('AUTORIZADO_SRI');
      expect(triggers).toContain('RECHAZADO_SRI');
      expect(triggers).toHaveLength(2);
    });
  });
});