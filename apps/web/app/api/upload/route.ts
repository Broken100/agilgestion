import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { jwtAuthService } from '@agilgestion/infrastructure';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
];

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const VALID_PURPOSES = ['qr', 'logo', 'avatar', 'certificado'];

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const payload = await jwtAuthService.verifyFromHeader(authHeader);

    if (!payload) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const purpose = formData.get('purpose') as string | null;

    if (!file) {
      return NextResponse.json({ success: false, message: 'Archivo no proporcionado' }, { status: 400 });
    }

    if (!purpose || !VALID_PURPOSES.includes(purpose)) {
      return NextResponse.json(
        { success: false, message: `Propósito inválido. Usar: ${VALID_PURPOSES.join(', ')}` },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, message: 'El archivo no debe superar los 5MB' },
        { status: 400 }
      );
    }

    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'png';
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { success: false, message: `Formato no permitido. Usar: ${ALLOWED_EXTENSIONS.join(', ')}` },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Tipo de archivo no válido' },
        { status: 400 }
      );
    }

    const timestamp = Date.now();
    const fileName = `${purpose}-${timestamp}.${ext}`;
    const businessUploadDir = path.join(process.cwd(), 'public', 'uploads', payload.businessId);
    const filePath = path.join(businessUploadDir, fileName);
    const publicPath = `/uploads/${payload.businessId}/${fileName}`;

    await mkdir(businessUploadDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      data: { path: publicPath, url: publicPath },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Error al subir el archivo' },
      { status: 500 }
    );
  }
}