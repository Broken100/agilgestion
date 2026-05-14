import { NextResponse } from 'next/server';
import { DomainError } from '@agilgestion/domain';

const domainErrorStatusMap: Record<string, number> = {
  STOCK_INSUFICIENTE: 409,
  PRODUCTO_NO_ENCONTRADO: 404,
  VENTA_SIN_LINEAS: 400,
  TRANSICION_INVALIDA: 422,
};

export function handleApiError(error: unknown, logPrefix: string) {
  console.error(`${logPrefix}:`, error);

  if (error instanceof DomainError) {
    const status = domainErrorStatusMap[error.code] ?? 500;
    return NextResponse.json(
      { success: false, message: error.message, code: error.code },
      { status }
    );
  }

  return NextResponse.json(
    { success: false, message: 'Error interno del servidor' },
    { status: 500 }
  );
}
