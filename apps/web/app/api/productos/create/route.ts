import { NextRequest, NextResponse } from 'next/server';
import { ProductoRepository } from '@agilgestion/infrastructure';
import { jwtAuthService } from '@agilgestion/infrastructure';
import { CreateProductoSchema } from '@agilgestion/shared';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const payload = await jwtAuthService.verifyFromHeader(authHeader);

    if (!payload) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = CreateProductoSchema.safeParse({
      ...body,
      businessId: payload.businessId,
    });

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      const firstError = Object.values(errors).flat()[0] ?? 'Datos invalidos';
      return NextResponse.json({ success: false, message: firstError }, { status: 400 });
    }

    const data = parsed.data;
    const productoRepo = new ProductoRepository();

    const existing = await productoRepo.findByCodigo(data.codigo, payload.businessId);
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Ya existe un producto con este codigo' },
        { status: 409 }
      );
    }

    const nuevoProducto = await productoRepo.create({
      id: crypto.randomUUID(),
      ...data,
      categoriaId: data.categoriaId ?? null,
      stockActual: data.stockActual ?? 0,
      stockMinimo: data.stockMinimo ?? 0,
      tipoImpuesto: data.tipoImpuesto ?? 'IVA15',
      activo: (data.stockActual ?? 0) > 0,
      precioConImpuesto: Number(data.precioUnitario),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    return NextResponse.json({ success: true, data: nuevoProducto }, { status: 201 });
  } catch (error) {
    console.error('Create producto error:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}