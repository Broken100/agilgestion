// packages/domain/src/services/CalculoSriService.ts
import type { TipoImpuesto, AmbienteSri, TipoComprobante } from '../types/enums';

export class CalculoSriService {
  calcularIVA(monto: number, tipoImpuesto: TipoImpuesto): number {
    switch (tipoImpuesto) {
      case 'IVA15':
        return Math.round(monto * 0.15 * 100) / 100;
      case 'IVA0':
        return 0;
      case 'ICE':
        return Math.round(monto * 0.10 * 100) / 100;
      default:
        return 0;
    }
  }

  calcularPorcentajeImpuesto(tipoImpuesto: TipoImpuesto): number {
    switch (tipoImpuesto) {
      case 'IVA15':
        return 15;
      case 'IVA0':
        return 0;
      case 'ICE':
        return 10;
      default:
        return 0;
    }
  }

  generarClaveAcceso(
    fechaEmision: Date,
    tipoComprobante: TipoComprobante,
    ruc: string,
    secuencia: string,
    ambiente: AmbienteSri
  ): string {
    const fechaStr = this.formatDateYYYYMMDD(fechaEmision);
    const tipoDoc = tipoComprobante === 'FACTURA' ? '01' : '04';
    const ambienteCode = ambiente === 'PRUEBAS' ? '2' : '1';
    const secuencialPad = secuencia.padStart(6, '0');
    const codigoNumerico = Math.floor(Math.random() * 99999999).toString().padStart(8, '0');
    const tipoEmision = '1';
    const estab = '001';
    const ptoEmi = '001';

    const base = fechaStr + tipoDoc + ruc + ambienteCode + secuencialPad + codigoNumerico + tipoEmision + estab + ptoEmi;
    const dv = this.calcularDigitoVerificador(base);

    return base + dv;
  }

  private formatDateYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  private calcularDigitoVerificador(numero: string): string {
    const coefficients = [
      2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7,
      2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7,
    ];
    let sum = 0;
    for (let i = 0; i < numero.length; i++) {
      sum += parseInt(numero.charAt(i), 10) * (coefficients[i] ?? 0);
    }
    const mod = sum % 11;
    if (mod === 11) return '9';
    if (mod === 10) return '0';
    return mod.toString();
  }
}