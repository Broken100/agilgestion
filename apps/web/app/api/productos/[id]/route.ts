import { NextRequest, NextResponse } from 'next/server';
import { ProductoRepository } from '@agilgestion/infrastructure';
import { jwtAuthService } from '@agilgestion/infrastructure';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = request.headers.get('authorization');
    const payload = await jwtAuthService.verifyFromHeader(authHeader);

    if (!payload) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const allowed = ['nombre', 'precioUnitario', 'stockActual', 'stockMinimo', 'tipoImpuesto', 'activo', 'categoriaId'];
    const updateData: Record<string, unknown> = {};

    for (const key of allowed) {
      if (key in body) {
        updateData[key] = key === 'precioUnitario' ? Number(body[key]) : body[key];
      }
    }

    if (updateData.stockActual !== undefined && Number(updateData.stockActual) <= 0) {
      updateData.activo = false;
    }

    const productoRepo = new ProductoRepository();
    const updated = await productoRepo.update(id, updateData as never);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update producto error:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = request.headers.get('authorization');
    const payload = await jwtAuthService.verifyFromHeader(authHeader);

    if (!payload) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    const { id } = await params;
    const productoRepo = new ProductoRepository();
    await productoRepo.update(id, { activo: false } as never);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete producto error:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}