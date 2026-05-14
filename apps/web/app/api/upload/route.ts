import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { jwtAuthService } from '@agilgestion/infrastructure';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const payload = await jwtAuthService.verifyFromHeader(authHeader);

    if (!payload) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, message: 'Archivo no proporcionado' }, { status: 400 });
    }

    const ext = file.name.split('.').pop() ?? 'png';
    const allowedExts = ['png', 'jpg', 'jpeg', 'gif', 'webp'];
    if (!allowedExts.includes(ext.toLowerCase())) {
      return NextResponse.json(
        { success: false, message: 'Formato no permitido. Usa: png, jpg, jpeg, gif, webp' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `qr-${payload.businessId}.${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.join(uploadDir, fileName);

    await mkdir(uploadDir, { recursive: true });
    await writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      data: { path: `/uploads/${fileName}` },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Error al subir el archivo' },
      { status: 500 }
    );
  }
}
