import { NextRequest, NextResponse } from 'next/server';
import { VentaRepository } from '@agilgestion/infrastructure';
import { jwtAuthService } from '@agilgestion/infrastructure';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const payload = await jwtAuthService.verifyFromHeader(authHeader);

    if (!payload) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '8', 10), 20);

    const ventaRepo = new VentaRepository();
    const topProducts = await ventaRepo.getTopSelling(payload.businessId, limit);

    return NextResponse.json({ success: true, data: topProducts });
  } catch (error) {
    console.error('Top selling error:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}