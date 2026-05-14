import { NextRequest, NextResponse } from 'next/server';
import { CategoriaRepository } from '@agilgestion/infrastructure';
import { jwtAuthService } from '@agilgestion/infrastructure';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = request.headers.get('authorization');
    const payload = await jwtAuthService.verifyFromHeader(authHeader);

    if (!payload) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    const { id } = await params;
    const categoriaRepo = new CategoriaRepository();
    const categoria = await categoriaRepo.findById(id);

    if (!categoria) {
      return NextResponse.json({ success: false, message: 'Categoria no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: categoria });
  } catch (error) {
    console.error('Get categoria error:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = request.headers.get('authorization');
    const payload = await jwtAuthService.verifyFromHeader(authHeader);

    if (!payload) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const allowed = ['nombre', 'descripcion'];
    const updateData: Record<string, unknown> = {};

    for (const key of allowed) {
      if (key in body) {
        updateData[key] = body[key];
      }
    }

    const categoriaRepo = new CategoriaRepository();
    const updated = await categoriaRepo.update(id, updateData as any);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update categoria error:', error);
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
    const categoriaRepo = new CategoriaRepository();
    await categoriaRepo.delete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete categoria error:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}