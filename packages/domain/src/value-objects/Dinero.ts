// packages/domain/src/value-objects/Dinero.ts
export interface Dinero {
  monto: number;
  moneda: 'USD';
}

export function crearDinero(monto: number, moneda: 'USD' = 'USD'): Dinero {
  return { monto, moneda };
}

export function formatearDinero(d: Dinero): string {
  return `$${d.monto.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

export function sumarDinero(a: Dinero, b: Dinero): Dinero {
  if (a.moneda !== b.moneda) throw new Error('No se pueden sumar monedas diferentes');
  return crearDinero(a.monto + b.monto, a.moneda);
}