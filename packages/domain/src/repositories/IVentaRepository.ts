// packages/domain/src/repositories/IVentaRepository.ts
import type { Venta, LineaVenta, LineaVentaInput } from '../entities/Venta';
import type { EstadoSri, MedioPago } from '../types/enums';

export interface IVentaRepository {
  create(venta: Venta, lineas: LineaVenta[]): Promise<Venta>;
  findById(id: string): Promise<Venta | null>;
  findByNumeroFactura(numero: string, businessId: string): Promise<Venta | null>;
  findByBusinessAndDateRange(businessId: string, desde: Date, hasta: Date): Promise<Venta[]>;
  findTodaySales(businessId: string): Promise<Venta[]>;
  updateEstadoSri(id: string, estado: EstadoSri, claveAcceso?: string, xml?: string): Promise<void>;
  getNextSecuencial(businessId: string): Promise<string>;
  getTopSelling(businessId: string, limit?: number): Promise<Array<{
    productoId: string;
    productoCodigo: string;
    productoNombre: string;
    precioUnitario: number;
    cantidadTotal: number;
    totalVendido: number;
    stockActual: number;
  }>>;
}