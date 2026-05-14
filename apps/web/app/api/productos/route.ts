import { NextRequest, NextResponse } from 'next/server';
import { ProductoRepository } from '@agilgestion/infrastructure';
import { jwtAuthService } from '@agilgestion/infrastructure';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const payload = await jwtAuthService.verifyFromHeader(authHeader);

    if (!payload) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('q');
    const available = searchParams.get('available') === 'true';
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 100);
    const offset = Math.max(parseInt(searchParams.get('offset') ?? '0', 10), 0);

    const productoRepo = new ProductoRepository();

    let productos;
    if (available) {
      productos = await productoRepo.findAvailable(payload.businessId, limit, offset);
    } else if (search && search.length >= 2) {
      productos = await productoRepo.search(search, payload.businessId, limit);
    } else {
      productos = await productoRepo.findByBusiness(payload.businessId);
    }

    return NextResponse.json({ success: true, data: productos });
  } catch (error) {
    console.error('Get productos error:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}