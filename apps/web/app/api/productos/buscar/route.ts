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
    const codigo = searchParams.get('codigo');
    const query = searchParams.get('q');

    const productoRepo = new ProductoRepository();

    if (codigo) {
      const producto = await productoRepo.findByCodigo(codigo, payload.businessId);
      if (!producto) {
        return NextResponse.json({ success: false, message: 'Producto no encontrado' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: producto });
    }

    if (query && query.length >= 2) {
      const productos = await productoRepo.search(query, payload.businessId, 10);
      return NextResponse.json({ success: true, data: productos });
    }

    return NextResponse.json({ success: false, message: 'Parametros requeridos: codigo o q' }, { status: 400 });
  } catch (error) {
    console.error('Search producto error:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}