import { NextRequest, NextResponse } from 'next/server';
import { SriWebServiceClient, SriComprobanteService } from '@agilgestion/sri';
import { jwtAuthService, VentaRepository, getPool, getDb, businesses } from '@agilgestion/infrastructure';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const payload = await jwtAuthService.verifyFromHeader(authHeader);

    if (!payload) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    const pool = await getPool();
    const db = getDb(pool);

    const ventaRepo = new VentaRepository();
    const webService = new SriWebServiceClient('PRUEBAS');
    const sriService = new SriComprobanteService(
      webService,
      process.env.SRI_CERT_PATH ?? '',
      process.env.SRI_CERT_PASSWORD ?? ''
    );

    const businessRows = await db.select().from(businesses).where(eq(businesses.id, payload.businessId));
    const business = businessRows[0];
    if (!business) {
      return NextResponse.json({ success: false, message: 'Negocio no encontrado' }, { status: 404 });
    }

    const ventasPendientes = await ventaRepo.findByBusinessAndDateRange(
      payload.businessId,
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      new Date()
    );

    const pendientes = ventasPendientes.filter(
      (v) => v.estadoSri === 'PENDIENTE' || v.estadoSri === 'RECHAZADO'
    );

    for (const venta of pendientes) {
      try {
        const result = await sriService.generarXml(venta as any, null, business);

        if (result) {
          const response = await webService.enviarRecepcionComprobantes(result.xmlFirmado);

          const nuevoEstado = response.estado === 'RECIBIDO'
            ? 'RECIBIDO'
            : response.estado === 'RECHAZADO'
            ? 'RECHAZADO'
            : 'PENDIENTE';

          await ventaRepo.updateEstadoSri(venta.id, nuevoEstado);
        }
      } catch (error) {
        console.error(`Error procesando venta ${venta.id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Procesadas ${pendientes.length} ventas`,
    });
  } catch (error) {
    console.error('SRI sync error:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}