// packages/domain/src/services/TransaccionPOSService.ts
import type { IVentaRepository } from '../repositories/IVentaRepository';
import type { IProductoRepository } from '../repositories/IProductoRepository';
import type { IAuditoriaRepository } from '../repositories/IAuditoriaRepository';
import type { Cliente } from '../entities/Cliente';
import type { Venta, LineaVenta, LineaVentaInput } from '../entities/Venta';
import type { MedioPago } from '../types/enums';
import { VentaSinLineasError, ProductoNoEncontradoError, StockInsuficienteError } from '../errors';

export class TransaccionPOSService {
  constructor(
    private ventaRepo: IVentaRepository,
    private productoRepo: IProductoRepository,
    private auditoriaRepo: IAuditoriaRepository
  ) {}

  async procesarVentaRegistrada(
    cliente: Cliente | null,
    lineasInput: LineaVentaInput[],
    businessId: string,
    userId: string,
    medioPago: MedioPago
  ): Promise<Venta> {
    if (lineasInput.length === 0) {
      throw new VentaSinLineasError();
    }

    const productoEntities = await Promise.all(
      lineasInput.map(async (linea) => {
        const producto = await this.productoRepo.findByCodigo(linea.productoCodigo, businessId);
        if (!producto) {
          throw new ProductoNoEncontradoError(linea.productoCodigo);
        }
        if (producto.stockActual < linea.cantidad) {
          throw new StockInsuficienteError(producto.nombre, producto.stockActual, linea.cantidad);
        }
        return { linea, producto };
      })
    );

    const calculatedLines: LineaVenta[] = productoEntities.map(({ linea, producto }) => {
      const subtotalLinea = linea.cantidad * linea.precioUnitario;
      const impuestoLinea = subtotalLinea * (linea.porcentajeImpuesto / 100);
      const totalLinea = subtotalLinea + impuestoLinea - (linea.descuento ?? 0);
      return {
        id: crypto.randomUUID(),
        ventaId: '',
        productoId: producto.id,
        productoCodigo: producto.codigo,
        productoNombre: producto.nombre,
        cantidad: linea.cantidad,
        precioUnitario: linea.precioUnitario,
        porcentajeImpuesto: linea.porcentajeImpuesto,
        descuento: linea.descuento ?? 0,
        subtotalLinea,
        impuestoLinea,
        totalLinea,
      };
    });

    const subtotal = calculatedLines.reduce((sum, l) => sum + l.subtotalLinea, 0);
    const descuentoTotal = calculatedLines.reduce((sum, l) => sum + l.descuento, 0);
    const impuestoTotal = calculatedLines.reduce((sum, l) => sum + l.impuestoLinea, 0);
    const total = subtotal - descuentoTotal + impuestoTotal;

    const numeroFactura = await this.generarNumeroFactura(businessId);

    const ventaId = crypto.randomUUID();
    const now = new Date();

    const venta: Venta = {
      id: ventaId,
      businessId,
      numeroFactura,
      fecha: now,
      clienteId: cliente?.id ?? null,
      lineas: calculatedLines.map(l => ({ ...l, ventaId })),
      subtotal,
      descuentoTotal,
      impuestoTotal,
      total,
      estadoSri: 'PENDIENTE',
      claveAcceso: null,
      xmlAutorizado: null,
      medioPago,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    };

    const savedVenta = await this.ventaRepo.create(venta, venta.lineas);

    await Promise.all(
      calculatedLines.map((linea) =>
        this.productoRepo.decrementStock(linea.productoId, linea.cantidad)
      )
    );

    await this.auditoriaRepo.log({
      id: crypto.randomUUID(),
      businessId,
      userId,
      tipo: 'VENTA_CREADA',
      entityType: 'Venta',
      entityId: savedVenta.id,
      metadata: { total: savedVenta.total, numeroFactura: savedVenta.numeroFactura },
      ipAddress: null,
      timestamp: now,
    });

    return savedVenta;
  }

  private async generarNumeroFactura(businessId: string): Promise<string> {
    const secuencial = await this.ventaRepo.getNextSecuencial(businessId);
    return `001-001-${secuencial}`;
  }
}