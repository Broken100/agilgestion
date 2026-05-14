// packages/shared/src/dto/venta.dto.ts
import type { CreateVentaType } from '../schemas/venta.schema';

export interface ProcesarVentaDTO extends CreateVentaType {
  businessId: string;
  userId: string;
}

export interface VentaResponseDTO {
  id: string;
  numeroFactura: string;
  total: number;
  estadoSri: string;
  fecha: string;
}

export interface DailySalesDTO {
  fecha: string;
  totalVentas: number;
  cantidadTransacciones: number;
  ventasPorMedioPago: Record<string, number>;
  ultimasVentas: VentaResponseDTO[];
}