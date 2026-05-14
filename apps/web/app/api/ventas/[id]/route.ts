import { NextRequest, NextResponse } from 'next/server';
import { VentaRepository } from '@agilgestion/infrastructure';
import { jwtAuthService } from '@agilgestion/infrastructure';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = request.headers.get('authorization');
    const payload = await jwtAuthService.verifyFromHeader(authHeader);

    if (!payload) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    const { id } = await params;
    const ventaRepo = new VentaRepository();
    const venta = await ventaRepo.findById(id);

    if (!venta) {
      return NextResponse.json({ success: false, message: 'Venta no encontrada' }, { status: 404 });
    }

    const clienteNombre = await ventaRepo.findClienteNombre(venta.clienteId);

    return NextResponse.json({
      success: true,
      data: {
        id: venta.id,
        numeroFactura: venta.numeroFactura,
        fecha: venta.fecha,
        total: Number(venta.total),
        subtotal: Number(venta.subtotal),
        impuestoTotal: Number(venta.impuestoTotal),
        medioPago: venta.medioPago,
        estadoSri: venta.estadoSri,
        claveAcceso: venta.claveAcceso,
        clienteNombre,
        lineas: venta.lineas.map((l) => ({
          productoNombre: l.productoNombre,
          cantidad: l.cantidad,
          precioUnitario: Number(l.precioUnitario),
          totalLinea: Number(l.totalLinea),
        })),
      },
    });
  } catch (error) {
    console.error('Get venta error:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}