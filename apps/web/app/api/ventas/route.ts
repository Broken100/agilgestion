import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { VentaRepository } from '@agilgestion/infrastructure';
import { ProductoRepository } from '@agilgestion/infrastructure';
import { AuditoriaRepository } from '@agilgestion/infrastructure';
import { TransaccionPOSService } from '@agilgestion/domain';
import { getPool, getDb } from '@agilgestion/infrastructure';
import { jwtAuthService } from '@agilgestion/infrastructure';
import { eq } from 'drizzle-orm';
import { businesses } from '@agilgestion/infrastructure';
import { handleApiError } from '@/lib/error-handler';

const CreateVentaBodySchema = z.object({
  lineas: z.array(
    z.object({
      productoId: z.string().uuid(),
      productoCodigo: z.string(),
      productoNombre: z.string(),
      cantidad: z.number().int().positive(),
      precioUnitario: z.number().positive(),
      porcentajeImpuesto: z.number().min(0).max(100),
      descuento: z.number().min(0).default(0),
    })
  ).min(1),
  clienteId: z.string().uuid().nullable(),
  medioPago: z.enum(['EFECTIVO', 'TARJETA_CREDITO', 'TARJETA_DEBITO', 'TRANSFERENCIA', 'CHEQUE']),
});

export async function GET(request: NextRequest) {
  try {
    const businessId = request.headers.get('x-business-id');
    if (!businessId) {
      return NextResponse.json({ success: false, message: 'Business ID requerido' }, { status: 401 });
    }

    const pool = await getPool();
    const db = getDb(pool);
    const ventaRepo = new VentaRepository();
    const ventas = await ventaRepo.findTodaySales(businessId);

    return NextResponse.json({
      success: true,
      data: ventas,
    });
  } catch (error) {
    return handleApiError(error, 'Get ventas error');
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const payload = await jwtAuthService.verifyFromHeader(authHeader);

    if (!payload) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = CreateVentaBodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: 'Datos inválidos', errors: parsed.error.errors },
        { status: 400 }
      );
    }

    const { lineas, clienteId, medioPago } = parsed.data;

    const pool = await getPool();
    const db = getDb(pool);

    const ventaRepo = new VentaRepository();
    const productoRepo = new ProductoRepository();
    const auditoriaRepo = new AuditoriaRepository();

    const transaccionService = new TransaccionPOSService(
      ventaRepo,
      productoRepo,
      auditoriaRepo
    );

    const cliente = clienteId
      ? await db.select().from(businesses).where(eq(businesses.id, clienteId)).then(r => r[0] ?? null)
      : null;

    const savedVenta = await transaccionService.procesarVentaRegistrada(
      cliente as any,
      lineas,
      payload.businessId,
      payload.sub,
      medioPago
    );

    return NextResponse.json({
      success: true,
      data: {
        id: savedVenta.id,
        numeroFactura: savedVenta.numeroFactura,
        total: savedVenta.total,
        estadoSri: savedVenta.estadoSri,
      },
    });
  } catch (error) {
    return handleApiError(error, 'Create venta error');
  }
}