import { NextRequest, NextResponse } from 'next/server';
import { NegocioRepository } from '@agilgestion/infrastructure';
import { jwtAuthService } from '@agilgestion/infrastructure';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const payload = await jwtAuthService.verifyFromHeader(authHeader);

    if (!payload) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    const negocioRepo = new NegocioRepository();
    const negocio = await negocioRepo.findById(payload.businessId);

    if (!negocio) {
      const negocioPorDefecto = {
        id: payload.businessId,
        nombre: '',
        ruc: '',
        nombreComercial: null,
        direccion: null,
        telefono: null,
        email: null,
        ambienteSri: 'PRUEBAS',
        certificadoPath: null,
        qrCodePath: null,
      };
      return NextResponse.json({ success: true, data: negocioPorDefecto });
    }

    return NextResponse.json({ success: true, data: negocio });
  } catch (error) {
    console.error('Get negocio error:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const payload = await jwtAuthService.verifyFromHeader(authHeader);

    if (!payload) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    if (payload.rol !== 'OWNER') {
      return NextResponse.json({ success: false, message: 'Solo el propietario puede editar' }, { status: 403 });
    }

    const body = await request.json();
    const { nombre, ruc, nombreComercial, direccion, telefono, email, ambienteSri, qrCodePath } = body;

    const negocioRepo = new NegocioRepository();
    const negocioActualizado = await negocioRepo.update(payload.businessId, {
      ...(nombre && { nombre }),
      ...(ruc && { ruc }),
      ...(nombreComercial !== undefined && { nombreComercial }),
      ...(direccion !== undefined && { direccion }),
      ...(telefono !== undefined && { telefono }),
      ...(email !== undefined && { email }),
      ...(ambienteSri && { ambienteSri }),
      ...(qrCodePath !== undefined && { qrCodePath }),
    });

    return NextResponse.json({ success: true, data: negocioActualizado });
  } catch (error) {
    console.error('Update negocio error:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}