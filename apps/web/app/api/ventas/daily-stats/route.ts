import { NextRequest, NextResponse } from 'next/server';
import { VentaRepository } from '@agilgestion/infrastructure';
import { getPool, getDb } from '@agilgestion/infrastructure';
import { jwtAuthService } from '@agilgestion/infrastructure';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const payload = await jwtAuthService.verifyFromHeader(authHeader);

    if (!payload) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    const pool = await getPool();
    const db = getDb(pool);
    const ventaRepo = new VentaRepository();
    const ventas = await ventaRepo.findTodaySales(payload.businessId);

    const totalVentas = ventas.reduce((sum, v) => sum + Number(v.total), 0);
    const cantidadTransacciones = ventas.length;

    const ventasPorMedioPago: Record<string, number> = {};
    for (const venta of ventas) {
      const medio = venta.medioPago;
      ventasPorMedioPago[medio] = (ventasPorMedioPago[medio] ?? 0) + Number(venta.total);
    }

    const ultimasVentas = ventas.slice(0, 10).map((v) => ({
      id: v.id,
      numeroFactura: v.numeroFactura,
      total: Number(v.total),
      estadoSri: v.estadoSri,
      clienteNombre: null,
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalVentas,
        cantidadTransacciones,
        ventasPorMedioPago,
        ultimasVentas,
      },
    });
  } catch (error) {
    console.error('Daily stats error:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}