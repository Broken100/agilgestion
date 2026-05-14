// packages/infrastructure/src/repositories/VentaRepository.ts
import type { IVentaRepository } from '@agilgestion/domain';
import type { Venta, LineaVenta } from '@agilgestion/domain';
import type { EstadoSri } from '@agilgestion/domain';
import { requireDb } from '../db';
import { ventas, lineasVenta, clientes } from '../db/schema';
import { eq, and, gte, lt, desc, sql } from 'drizzle-orm';

export class VentaRepository implements IVentaRepository {
  async create(venta: Venta, lineas: LineaVenta[]): Promise<Venta> {
    const db = requireDb();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [ventaCreated] = await db.insert(ventas).values({
      id: venta.id,
      businessId: venta.businessId,
      numeroFactura: venta.numeroFactura,
      fecha: venta.fecha,
      clienteId: venta.clienteId,
      subtotal: String(venta.subtotal),
      descuentoTotal: String(venta.descuentoTotal),
      impuestoTotal: String(venta.impuestoTotal),
      total: String(venta.total),
      estadoSri: venta.estadoSri,
      claveAcceso: venta.claveAcceso,
      xmlAutorizado: venta.xmlAutorizado,
      medioPago: venta.medioPago,
      createdBy: venta.createdBy,
      createdAt: venta.createdAt,
      updatedAt: venta.updatedAt,
    } as any).returning();

    for (const linea of lineas) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await db.insert(lineasVenta).values({
        id: linea.id,
        ventaId: linea.ventaId,
        productoId: linea.productoId,
        productoCodigo: linea.productoCodigo,
        productoNombre: linea.productoNombre,
        cantidad: linea.cantidad,
        precioUnitario: String(linea.precioUnitario),
        porcentajeImpuesto: String(linea.porcentajeImpuesto),
        descuento: String(linea.descuento),
        subtotalLinea: String(linea.subtotalLinea),
        impuestoLinea: String(linea.impuestoLinea),
        totalLinea: String(linea.totalLinea),
      } as any);
    }

    return ventaCreated as unknown as Venta;
  }

  async findById(id: string): Promise<Venta | null> {
    const db = requireDb();
    const result = await db.select().from(ventas).where(eq(ventas.id, id));
    const ventaRow = result[0] ?? null;
    if (!ventaRow) return null;

    const lineasResult = await db
      .select()
      .from(lineasVenta)
      .where(eq(lineasVenta.ventaId, id));

    const mappedLineas: LineaVenta[] = lineasResult.map((row: any) => ({
      id: row.id,
      ventaId: row.ventaId,
      productoId: row.productoId,
      productoCodigo: row.productoCodigo,
      productoNombre: row.productoNombre,
      cantidad: row.cantidad,
      precioUnitario: Number(row.precioUnitario),
      porcentajeImpuesto: Number(row.porcentajeImpuesto),
      descuento: Number(row.descuento ?? 0),
      subtotalLinea: Number(row.subtotalLinea),
      impuestoLinea: Number(row.impuestoLinea),
      totalLinea: Number(row.totalLinea),
    }));

    return { ...(ventaRow as unknown as Venta), lineas: mappedLineas };
  }

  async findByNumeroFactura(numero: string, businessId: string): Promise<Venta | null> {
    const db = requireDb();
    const result = await db
      .select()
      .from(ventas)
      .where(and(eq(ventas.numeroFactura, numero), eq(ventas.businessId, businessId)));
    return (result[0] ?? null) as unknown as Venta | null;
  }

  async findByBusinessAndDateRange(
    businessId: string,
    desde: Date,
    hasta: Date
  ): Promise<Venta[]> {
    const db = requireDb();
    return (await db
      .select()
      .from(ventas)
      .where(
        and(
          eq(ventas.businessId, businessId),
          gte(ventas.fecha, desde),
          lt(ventas.fecha, hasta)
        )
      )
      .orderBy(desc(ventas.fecha))) as unknown as Venta[];
  }

  async findTodaySales(businessId: string): Promise<Venta[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.findByBusinessAndDateRange(businessId, today, tomorrow);
  }

  async updateEstadoSri(
    id: string,
    estado: EstadoSri,
    claveAcceso?: string,
    xml?: string
  ): Promise<void> {
    const db = requireDb();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.update(ventas).set({
      estadoSri: estado,
      ...(claveAcceso ? { claveAcceso } : {}),
      ...(xml ? { xmlAutorizado: xml } : {}),
      updatedAt: new Date(),
    } as any).where(eq(ventas.id, id));
  }

  async getNextSecuencial(businessId: string): Promise<string> {
    const db = requireDb();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysSales = await db
      .select({ numeroFactura: ventas.numeroFactura })
      .from(ventas)
      .where(
        and(
          eq(ventas.businessId, businessId),
          gte(ventas.fecha, today),
          lt(ventas.fecha, tomorrow)
        )
      );

    if (todaysSales.length === 0) {
      return '000000001';
    }

    const maxSecuencial = todaysSales.reduce((max: number, v: { numeroFactura: string }) => {
      const parts = v.numeroFactura.split('-');
      const seq = parseInt(parts[2] ?? '0', 10);
      return seq > max ? seq : max;
    }, 0);

    return String(maxSecuencial + 1).padStart(9, '0');
  }

  async getTopSelling(businessId: string, limit = 8): Promise<Array<{
    productoId: string;
    productoCodigo: string;
    productoNombre: string;
    precioUnitario: number;
    cantidadTotal: number;
    totalVendido: number;
    stockActual: number;
    tipoImpuesto: string;
  }>> {
    const db = requireDb();
    const result = await db.execute(sql`
      SELECT
        lv.producto_id AS productoId,
        lv.producto_codigo AS productoCodigo,
        lv.producto_nombre AS productoNombre,
        CAST(lv.precio_unitario AS NUMERIC(10,2)) AS precioUnitario,
        SUM(lv.cantidad) AS cantidadTotal,
        CAST(SUM(lv.total_linea) AS NUMERIC(12,2)) AS totalVendido,
        p.stock_actual AS stockActual,
        p.tipo_impuesto AS tipoImpuesto
      FROM lineas_venta lv
      JOIN ventas v ON lv.venta_id = v.id
      JOIN productos p ON lv.producto_id = p.id
      WHERE v.business_id = ${businessId}
      GROUP BY lv.producto_id, lv.producto_codigo, lv.producto_nombre, lv.precio_unitario, p.stock_actual, p.tipo_impuesto
      ORDER BY SUM(lv.cantidad) DESC
      LIMIT ${limit}
    `);
    return (result as any).rows.map((row: any) => ({
      productoId: row.productoid,
      productoCodigo: row.productocodigo,
      productoNombre: row.productonombre,
      precioUnitario: Number(row.preciounitario),
      cantidadTotal: Number(row.cantidadtotal),
      totalVendido: Number(row.totalvendido),
      stockActual: Number(row.stockactual),
      tipoImpuesto: row.tipoimpuesto,
    }));
  }

  async findClienteNombre(clienteId: string | null): Promise<string | null> {
    if (!clienteId) return null;
    const db = requireDb();
    const result = await db.select({ razonSocial: clientes.razonSocial }).from(clientes).where(eq(clientes.id, clienteId));
    return result[0]?.razonSocial ?? null;
  }
}