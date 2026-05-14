// packages/domain/src/value-objects/CodigoAcceso.ts
export interface CodigoAcceso {
  valor: string;
  fechaEmision: Date;
  ambiente: 'PRUEBAS' | 'PRODUCCION';
  tipoComprobante: 'FACTURA' | 'NOTA_CREDITO';
  secuencia: string;
}

export function crearCodigoAcceso(valor: string): CodigoAcceso {
  return {
    valor,
    fechaEmision: new Date(),
    ambiente: 'PRUEBAS',
    tipoComprobante: 'FACTURA',
    secuencia: valor.substring(16, 24),
  };
}

export function validarCodigoAcceso(valor: string): boolean {
  if (valor.length !== 49) return false;
  if (!/^\d+$/.test(valor)) return false;
  return true;
}