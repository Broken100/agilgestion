// packages/domain/src/types/enums.ts
export type EstadoSri = 'PENDIENTE' | 'RECIBIDO' | 'AUTORIZADO' | 'RECHAZADO';
export type MedioPago = 'EFECTIVO' | 'TARJETA_CREDITO' | 'TARJETA_DEBITO' | 'TRANSFERENCIA' | 'CHEQUE';
export type TipoImpuesto = 'IVA15' | 'IVA0' | 'ICE';
export type RolUsuario = 'OWNER' | 'ADMIN' | 'CAJERO';
export type AmbienteSri = 'PRUEBAS' | 'PRODUCCION';
export type TipoComprobante = 'FACTURA' | 'NOTA_CREDITO';