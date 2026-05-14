import { NextRequest, NextResponse } from 'next/server';
import { RegisterSchema } from '@agilgestion/shared';
import { UsuarioRepository, NegocioRepository } from '@agilgestion/infrastructure';
import { hashPassword } from '@agilgestion/infrastructure';
import { jwtAuthService } from '@agilgestion/infrastructure';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: 'Datos inválidos', errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password, nombre, nombreNegocio, ruc } = parsed.data;

    const usuarioRepo = new UsuarioRepository();
    const negocioRepo = new NegocioRepository();

    const existingUser = await usuarioRepo.findByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Ya existe un usuario con este email' },
        { status: 409 }
      );
    }

    const existingNegocio = await negocioRepo.findByRuc(ruc);
    if (existingNegocio) {
      return NextResponse.json(
        { success: false, message: 'Ya existe un negocio con este RUC' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const negocio = await negocioRepo.create({
      nombre: nombreNegocio,
      ruc,
      nombreComercial: nombreNegocio,
      ambienteSri: 'PRUEBAS',
    });

    const usuario = await usuarioRepo.create({
      email,
      passwordHash,
      nombre,
      rol: 'OWNER',
      activo: true,
      businessId: negocio.id,
    } as any);

    const token = await jwtAuthService.sign(usuario as any);

    return NextResponse.json(
      {
        success: true,
        token,
        user: {
          id: usuario.id,
          email: usuario.email,
          nombre: usuario.nombre,
          rol: usuario.rol,
          businessId: usuario.businessId,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}