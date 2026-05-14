import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { LoginSchema } from '@agilgestion/shared';
import { UsuarioRepository } from '@agilgestion/infrastructure';
import { verifyPassword } from '@agilgestion/infrastructure';
import { jwtAuthService } from '@agilgestion/infrastructure';

const LoginBodySchema = LoginSchema;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = LoginBodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: 'Datos inválidos' },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    const usuarioRepo = new UsuarioRepository();
    const usuario = await usuarioRepo.findByEmail(email);

    if (!usuario) {
      return NextResponse.json(
        { success: false, message: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    if (!usuario.activo) {
      return NextResponse.json(
        { success: false, message: 'Usuario inactivo' },
        { status: 403 }
      );
    }

    const validPassword = await verifyPassword(password, usuario.passwordHash);

    if (!validPassword) {
      return NextResponse.json(
        { success: false, message: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    const token = await jwtAuthService.sign(usuario);

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol,
        businessId: usuario.businessId,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}