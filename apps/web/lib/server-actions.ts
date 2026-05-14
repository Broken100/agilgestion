// apps/web/lib/server-actions.ts
'use client';

import type { LineaVentaInput, MedioPago } from '@agilgestion/domain';
import { apiFetch } from '@/lib/api-client';

export async function procesarVentaAction(params: {
  lineas: LineaVentaInput[];
  clienteId: string | null;
  medioPago: MedioPago;
}) {
  const response = await apiFetch('/api/ventas', {
    method: 'POST',
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error('Error al procesar la venta');
  }

  return response.json();
}