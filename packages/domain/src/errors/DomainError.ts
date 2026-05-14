// packages/domain/src/errors/DomainError.ts
export class DomainError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'DomainError';
  }
}

export class StockInsuficienteError extends DomainError {
  constructor(
    public readonly productoNombre: string,
    public readonly stockActual: number,
    public readonly cantidadRequerida: number
  ) {
    super('STOCK_INSUFICIENTE', `Stock insuficiente para ${productoNombre}: requerido ${cantidadRequerida}, disponible ${stockActual}`, {
      productoNombre,
      stockActual,
      cantidadRequerida,
    });
  }
}

export class ProductoNoEncontradoError extends DomainError {
  constructor(public readonly codigo: string) {
    super('PRODUCTO_NO_ENCONTRADO', `Producto con código ${codigo} no encontrado`, { codigo });
  }
}

export class VentaSinLineasError extends DomainError {
  constructor() {
    super('VENTA_SIN_LINEAS', 'La venta debe tener al menos una línea de producto');
  }
}

export class TransicionInvalidaError extends DomainError {
  constructor(
    public readonly estadoActual: string,
    public readonly trigger: string
  ) {
    super('TRANSICION_INVALIDA', `Transición inválida: ${estadoActual} -> ${trigger}`, {
      estadoActual,
      trigger,
    });
  }
}