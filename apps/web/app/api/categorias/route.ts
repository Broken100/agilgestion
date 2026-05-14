import { NextRequest, NextResponse } from 'next/server';
import { CategoriaRepository } from '@agilgestion/infrastructure';
import { jwtAuthService } from '@agilgestion/infrastructure';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const payload = await jwtAuthService.verifyFromHeader(authHeader);

    if (!payload) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    const categoriaRepo = new CategoriaRepository();
    const categorias = await categoriaRepo.findByBusiness(payload.businessId);

    return NextResponse.json({ success: true, data: categorias });
  } catch (error) {
    console.error('Get categorias error:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
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
    const { nombre, descripcion } = body;

    if (!nombre) {
      return NextResponse.json(
        { success: false, message: 'nombre es requerido' },
        { status: 400 }
      );
    }

    const categoriaRepo = new CategoriaRepository();
    const nuevaCategoria = await categoriaRepo.create({
      id: crypto.randomUUID(),
      businessId: payload.businessId,
      nombre,
      descripcion: descripcion ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true, data: nuevaCategoria }, { status: 201 });
  } catch (error) {
    console.error('Create categoria error:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}