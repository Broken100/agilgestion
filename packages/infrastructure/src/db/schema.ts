// packages/infrastructure/src/db/schema.ts
import {
  pgTable,
  text,
  integer,
  decimal,
  timestamp,
  boolean,
  uuid,
  pgPolicy,
  primaryKey,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const businesses = pgTable('businesses', {
  id: uuid('id').primaryKey().defaultRandom(),
  nombre: text('nombre').notNull(),
  ruc: text('ruc').notNull().unique(),
  nombreComercial: text('nombre_comercial'),
  direccion: text('direccion'),
  telefono: text('telefono'),
  email: text('email'),
  ambienteSri: text('ambiente_sri').default('PRUEBAS'),
  certificadoPath: text('certificado_path'),
  certificadoPassword: text('certificado_password'),
  qrCodePath: text('qr_code_path'),
  logoPath: text('logo_path'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    businessId: uuid('business_id')
      .references(() => businesses.id)
      .notNull(),
    email: text('email').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    nombre: text('nombre').notNull(),
    rol: text('rol').notNull().default('OWNER'),
    avatar: text('avatar'),
    activo: boolean('activo').default(true),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [
    pgPolicy('users_rls', {
      for: 'all',
      using: sql`business_id = current_setting('app.current_business_id')::uuid`,
      withCheck: sql`business_id = current_setting('app.current_business_id')::uuid`,
    }),
  ]
);

export const categorias = pgTable(
  'categorias',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    businessId: uuid('business_id')
      .references(() => businesses.id)
      .notNull(),
    nombre: text('nombre').notNull(),
    descripcion: text('descripcion'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => [
    pgPolicy('categorias_rls', {
      for: 'all',
      using: sql`business_id = current_setting('app.current_business_id')::uuid`,
      withCheck: sql`business_id = current_setting('app.current_business_id')::uuid`,
    }),
  ]
);

export const productos = pgTable(
  'productos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    businessId: uuid('business_id')
      .references(() => businesses.id)
      .notNull(),
    codigo: text('codigo').notNull(),
    nombre: text('nombre').notNull(),
    precioUnitario: decimal('precio_unitario', { precision: 10, scale: 2 }).notNull(),
    categoriaId: uuid('categoria_id').references(() => categorias.id),
    stockActual: integer('stock_actual').default(0),
    stockMinimo: integer('stock_minimo').default(0),
    tipoImpuesto: text('tipo_impuesto').notNull().default('IVA15'),
    activo: boolean('activo').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => [
    pgPolicy('productos_rls', {
      for: 'all',
      using: sql`business_id = current_setting('app.current_business_id')::uuid`,
      withCheck: sql`business_id = current_setting('app.current_business_id')::uuid`,
    }),
    index('idx_productos_business_codigo').on(table.businessId, table.codigo),
    index('idx_productos_business_nombre').on(table.businessId, table.nombre),
  ]
);

export const clientes = pgTable(
  'clientes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    businessId: uuid('business_id')
      .references(() => businesses.id)
      .notNull(),
    tipoIdentificacion: text('tipo_identificacion').notNull(),
    identificacion: text('identificacion').notNull(),
    razonSocial: text('razon_social').notNull(),
    nombreComercial: text('nombre_comercial'),
    direccion: text('direccion'),
    telefono: text('telefono'),
    email: text('email'),
    activo: boolean('activo').default(true),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [
    pgPolicy('clientes_rls', {
      for: 'all',
      using: sql`business_id = current_setting('app.current_business_id')::uuid`,
      withCheck: sql`business_id = current_setting('app.current_business_id')::uuid`,
    }),
  ]
);

export const ventas = pgTable(
  'ventas',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    businessId: uuid('business_id')
      .references(() => businesses.id)
      .notNull(),
    numeroFactura: text('numero_factura').notNull(),
    fecha: timestamp('fecha').defaultNow(),
    clienteId: uuid('cliente_id').references(() => clientes.id),
    subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
    descuentoTotal: decimal('descuento_total', { precision: 10, scale: 2 }).default('0'),
    impuestoTotal: decimal('impuesto_total', { precision: 10, scale: 2 }).notNull(),
    total: decimal('total', { precision: 10, scale: 2 }).notNull(),
    estadoSri: text('estado_sri').notNull().default('PENDIENTE'),
    claveAcceso: text('clave_acceso'),
    xmlAutorizado: text('xml_autorizado'),
    medioPago: text('medio_pago').notNull(),
    createdBy: uuid('created_by').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => [
    pgPolicy('ventas_rls', {
      for: 'all',
      using: sql`business_id = current_setting('app.current_business_id')::uuid`,
      withCheck: sql`business_id = current_setting('app.current_business_id')::uuid`,
    }),
  ]
);

export const lineasVenta = pgTable('lineas_venta', {
  id: uuid('id').primaryKey().defaultRandom(),
  ventaId: uuid('venta_id')
    .references(() => ventas.id)
    .notNull(),
  productoId: uuid('producto_id')
    .references(() => productos.id)
    .notNull(),
  productoCodigo: text('producto_codigo').notNull(),
  productoNombre: text('producto_nombre').notNull(),
  cantidad: integer('cantidad').notNull(),
  precioUnitario: decimal('precio_unitario', { precision: 10, scale: 2 }).notNull(),
  porcentajeImpuesto: decimal('porcentaje_impuesto', { precision: 5, scale: 2 }).notNull(),
  descuento: decimal('descuento', { precision: 10, scale: 2 }).default('0'),
  subtotalLinea: decimal('subtotal_linea', { precision: 10, scale: 2 }).notNull(),
  impuestoLinea: decimal('impuesto_linea', { precision: 10, scale: 2 }).notNull(),
  totalLinea: decimal('total_linea', { precision: 10, scale: 2 }).notNull(),
});

export const auditLog = pgTable('audit_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id').notNull(),
  userId: uuid('user_id'),
  tipo: text('tipo').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: uuid('entity_id'),
  metadata: text('metadata'),
  ipAddress: text('ip_address'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

export const sriQueue = pgTable('sri_queue', {
  id: uuid('id').primaryKey().defaultRandom(),
  ventaId: uuid('venta_id')
    .references(() => ventas.id)
    .notNull(),
  xmlFirmado: text('xml_firmado').notNull(),
  claveAcceso: text('clave_acceso').notNull(),
  attempts: integer('attempts').default(0),
  maxAttempts: integer('max_attempts').default(5),
  status: text('status').notNull().default('PENDING'),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow(),
  lastAttemptAt: timestamp('last_attempt_at'),
});

export type Business = typeof businesses.$inferSelect;
export type User = typeof users.$inferSelect;
export type Categoria = typeof categorias.$inferSelect;
export type Producto = typeof productos.$inferSelect;
export type Cliente = typeof clientes.$inferSelect;
export type Venta = typeof ventas.$inferSelect;
export type LineaVenta = typeof lineasVenta.$inferSelect;
export type AuditLog = typeof auditLog.$inferSelect;
export type SriQueue = typeof sriQueue.$inferSelect;