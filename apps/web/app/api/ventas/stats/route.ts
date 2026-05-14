import { NextRequest, NextResponse } from 'next/server';
import { VentaRepository } from '@agilgestion/infrastructure';
import { getPool } from '@agilgestion/infrastructure';
import { jwtAuthService } from '@agilgestion/infrastructure';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const payload = await jwtAuthService.verifyFromHeader(authHeader);

    if (!payload) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'today';

    const pool = await getPool();
    const ventaRepo = new VentaRepository();

    let desde: Date;
    const hasta = new Date();

    switch (period) {
      case 'today':
        desde = new Date();
        desde.setHours(0, 0, 0, 0);
        break;
      case 'week':
        desde = new Date();
        desde.setDate(desde.getDate() - 7);
        break;
      case 'month':
        desde = new Date();
        desde.setMonth(desde.getMonth() - 1);
        break;
      default:
        desde = new Date();
        desde.setHours(0, 0, 0, 0);
    }

    const ventas = await ventaRepo.findByBusinessAndDateRange(payload.businessId, desde, hasta);

    const total = ventas.reduce((sum, v) => sum + parseFloat(String(v.total)), 0);
    const impuestoTotal = ventas.reduce((sum, v) => sum + parseFloat(String(v.impuestoTotal)), 0);

    const stats = {
      totalVentas: ventas.length,
      total: Number(total.toFixed(2)),
      ivaRecaudado: Number(impuestoTotal.toFixed(2)),
      promedioVenta: Number(ventas.length > 0 ? (total / ventas.length).toFixed(2) : '0'),
    };

    return NextResponse.json({ success: true, data: { stats, ventas } });
  } catch (error) {
    console.error('Get ventas stats error:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}