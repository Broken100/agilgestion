# AG-Ágil Gestión — Documentación Técnica

## 1. ARQUITECTURA DEL PROYECTO

### 1.1 Estructura Monorepo

```
agilgestion/
├── apps/
│   └── web/                    → Next.js 15 App Router + React 19
├── packages/
│   ├── domain/                 → Entidades, interfaces, servicios de dominio, errores
│   ├── infrastructure/         → Schema Drizzle ORM, pool BD, repositorios, JWT, bcrypt
│   ├── shared/                 → Schemas Zod, DTOs, animaciones, tipos compartidos
│   ├── sri/                    → XML facturación SRI, certificados, cliente SOAP, cola offline
│   └── ui/                     → Componentes UI reutilizables
├── tests/
│   └── e2e/                    → Tests Playwright
├── docs/                       → Documentación
├── openspec/                   → Especificaciones SDD
├── turbo.json                  → Configuración Turborepo
├── pnpm-workspace.yaml         → Workspaces pnpm
├── drizzle.config.ts           → Configuración Drizzle ORM
└── package.json                → Raíz del monorepo
```

### 1.2 Grafo de dependencias entre paquetes

```
@agilgestion/web
  → @agilgestion/domain
  → @agilgestion/infrastructure
  → @agilgestion/shared
  → @agilgestion/sri
  → @agilgestion/ui

@agilgestion/infrastructure
  → @agilgestion/domain
  → @agilgestion/shared

@agilgestion/sri
  → @agilgestion/domain
  → @agilgestion/shared

@agilgestion/ui
  → @agilgestion/domain

@agilgestion/domain → (sin dependencias internas)
```

### 1.3 Stack tecnológico

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| Next.js | 15 (App Router) | Framework web fullstack |
| React | 19 | UI |
| TypeScript | 5.7 | Tipado estático |
| Tailwind CSS | 4 | Estilos utilitarios |
| Motion | 12.38 | Animaciones |
| Zustand | 5 | Estado global |
| Drizzle ORM | 0.45 | ORM PostgreSQL |
| Drizzle Kit | 0.31 | Migraciones |
| PostgreSQL (Neon) | — | Base de datos |
| Zod | 3.23 | Validación de esquemas |
| Jose | 5.9 | JWT |
| Bcryptjs | 3.0 | Hash de contraseñas |
| Sonner | 2.0 | Toasts |
| Recharts | 3.8 | Gráficos |
| Lucide React | 1.14 | Iconos |
| shadcn/ui | — | Componentes base (Radix primitives) |

---

## 2. BASE DE DATOS

### 2.1 Conexión

```
Plataforma: Neon (Serverless PostgreSQL)
Pool máximo: 10 conexiones
Singleton: getPool() — instancia perezosa única
RLS: current_setting('app.current_business_id') para multi-tenant
```

### 2.2 Esquema completo

#### Tabla: `businesses`

Propósito: Almacena la configuración de cada negocio (tenant).

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | `uuid` | PK, defaultRandom() | Identificador único |
| nombre | `text` | NOT NULL | Razón social |
| ruc | `text` | NOT NULL, UNIQUE | RUC 13 dígitos |
| nombre_comercial | `text` | nullable | Nombre comercial |
| direccion | `text` | nullable | Dirección matriz |
| telefono | `text` | nullable | Teléfono de contacto |
| email | `text` | nullable | Correo electrónico |
| ambiente_sri | `text` | default 'PRUEBAS' | PRUEBAS | PRODUCCION |
| certificado_path | `text` | nullable | Ruta archivo .p12 |
| certificado_password | `text` | nullable | Contraseña del certificado |
| qr_code_path | `text` | nullable | Ruta imagen QR para transferencias |
| created_at | `timestamp` | defaultNow() | Fecha de creación |

#### Tabla: `users`

Propósito: Usuarios del sistema con roles.

RLS: `business_id = current_setting('app.current_business_id')::uuid`

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | `uuid` | PK, defaultRandom() | |
| business_id | `uuid` | FK → businesses.id, NOT NULL | Tenant |
| email | `text` | NOT NULL, UNIQUE | Correo de acceso |
| password_hash | `text` | NOT NULL | bcrypt, salt 12 |
| nombre | `text` | NOT NULL | Nombre completo |
| rol | `text` | NOT NULL, default 'OWNER' | OWNER | ADMIN | CAJERO |
| activo | `boolean` | default true | Usuario activo |
| created_at | `timestamp` | defaultNow() | |

#### Tabla: `categorias`

Propósito: Categorías de productos.

RLS: habilitado

| Columna | Tipo | Restricciones |
|---------|------|---------------|
| id | `uuid` | PK, defaultRandom() |
| business_id | `uuid` | FK → businesses.id, NOT NULL |
| nombre | `text` | NOT NULL |
| descripcion | `text` | nullable |
| created_at | `timestamp` | defaultNow() |
| updated_at | `timestamp` | defaultNow() |

#### Tabla: `productos`

Propósito: Catálogo de productos.

RLS: habilitado
Índices: (business_id, codigo), (business_id, nombre)

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | `uuid` | PK, defaultRandom() | |
| business_id | `uuid` | FK → businesses.id, NOT NULL | |
| codigo | `text` | NOT NULL | Código interno |
| nombre | `text` | NOT NULL | Nombre del producto |
| precio_unitario | `decimal(10,2)` | NOT NULL | Precio sin IVA |
| categoria_id | `uuid` | FK → categorias.id, nullable | |
| stock_actual | `integer` | default 0 | Stock disponible |
| stock_minimo | `integer` | default 0 | Alerta bajo stock |
| tipo_impuesto | `text` | NOT NULL, default 'IVA15' | IVA15 | IVA0 | ICE |
| activo | `boolean` | default true | Soft delete |
| created_at | `timestamp` | defaultNow() | |
| updated_at | `timestamp` | defaultNow() | |

#### Tabla: `clientes`

Propósito: Clientes para facturación electrónica.

RLS: habilitado

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | `uuid` | PK, defaultRandom() | |
| business_id | `uuid` | FK → businesses.id, NOT NULL | |
| tipo_identificacion | `text` | NOT NULL | 04(RUC) | 05(CEDULA) | 06(PASAPORTE) |
| identificacion | `text` | NOT NULL | Número de identificación |
| razon_social | `text` | NOT NULL | Razón social |
| nombre_comercial | `text` | nullable | |
| direccion | `text` | nullable | |
| telefono | `text` | nullable | |
| email | `text` | nullable | |
| activo | `boolean` | default true | |
| created_at | `timestamp` | defaultNow() | |

#### Tabla: `ventas`

Propósito: Facturas/cabecera de ventas.

RLS: habilitado

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | `uuid` | PK, defaultRandom() | |
| business_id | `uuid` | FK → businesses.id, NOT NULL | |
| numero_factura | `text` | NOT NULL | 001-001-{secuencial} |
| fecha | `timestamp` | defaultNow() | Fecha de emisión |
| cliente_id | `uuid` | FK → clientes.id, nullable | |
| subtotal | `decimal(10,2)` | NOT NULL | |
| descuento_total | `decimal(10,2)` | default '0' | |
| impuesto_total | `decimal(10,2)` | NOT NULL | |
| total | `decimal(10,2)` | NOT NULL | |
| estado_sri | `text` | NOT NULL, default 'PENDIENTE' | PENDIENTE | RECIBIDO | AUTORIZADO | RECHAZADO |
| clave_acceso | `text` | nullable | 49 dígitos SRI |
| xml_autorizado | `text` | nullable | XML firmado |
| medio_pago | `text` | NOT NULL | EFECTIVO | TARJETA_CREDITO | TARJETA_DEBITO | TRANSFERENCIA | CHEQUE |
| created_by | `uuid` | FK → users.id, nullable | |
| created_at | `timestamp` | defaultNow() | |
| updated_at | `timestamp` | defaultNow() | |

#### Tabla: `lineas_venta`

Propósito: Detalle/líneas de cada factura.

| Columna | Tipo | Restricciones |
|---------|------|---------------|
| id | `uuid` | PK, defaultRandom() |
| venta_id | `uuid` | FK → ventas.id, NOT NULL |
| producto_id | `uuid` | FK → productos.id, NOT NULL |
| producto_codigo | `text` | NOT NULL |
| producto_nombre | `text` | NOT NULL |
| cantidad | `integer` | NOT NULL |
| precio_unitario | `decimal(10,2)` | NOT NULL |
| porcentaje_impuesto | `decimal(5,2)` | NOT NULL |
| descuento | `decimal(10,2)` | default '0' |
| subtotal_linea | `decimal(10,2)` | NOT NULL |
| impuesto_linea | `decimal(10,2)` | NOT NULL |
| total_linea | `decimal(10,2)` | NOT NULL |

#### Tabla: `audit_log`

Propósito: Auditoría de operaciones.

| Columna | Tipo | Restricciones |
|---------|------|---------------|
| id | `uuid` | PK, defaultRandom() |
| business_id | `uuid` | NOT NULL |
| user_id | `uuid` | nullable |
| tipo | `text` | NOT NULL |
| entity_type | `text` | NOT NULL |
| entity_id | `uuid` | nullable |
| metadata | `text` | nullable (JSON string) |
| ip_address | `text` | nullable |
| timestamp | `timestamp` | defaultNow(), NOT NULL |

#### Tabla: `sri_queue`

Propósito: Cola de envío de comprobantes al SRI con reintentos.

| Columna | Tipo | Restricciones |
|---------|------|---------------|
| id | `uuid` | PK, defaultRandom() |
| venta_id | `uuid` | FK → ventas.id, NOT NULL |
| xml_firmado | `text` | NOT NULL |
| clave_acceso | `text` | NOT NULL |
| attempts | `integer` | default 0 |
| max_attempts | `integer` | default 5 |
| status | `text` | NOT NULL, default 'PENDING' |
| error_message | `text` | nullable |
| created_at | `timestamp` | defaultNow() |
| last_attempt_at | `timestamp` | nullable |

### 2.3 Migraciones

```
0000_polite_jamie_braddock.sql  → Creación de todas las tablas, índices, RLS
0001_lively_jack_flag.sql       → ALTER TABLE businesses ADD COLUMN qr_code_path text
```

---

## 3. API (ROUTE HANDLERS)

### 3.1 Autenticación

| Método | Ruta | Auth | Validación Zod | Descripción |
|--------|------|------|----------------|-------------|
| POST | `/api/auth/login` | ❌ | ✅ | Login email + password |
| POST | `/api/auth/register` | ❌ | ✅ | Registro con negocio |

**JWT:**
- Algoritmo: HS256
- Expiración: 24h
- Payload: `{ sub, email, businessId, rol, iat, exp }`
- Librería: `jose` (SignJWT / jwtVerify)
- Se almacena en localStorage vía Zustand persist

### 3.2 Ventas

| Método | Ruta | Auth | Validación Zod | Descripción |
|--------|------|------|----------------|-------------|
| GET | `/api/ventas` | Header x-business-id | ❌ | Ventas del día |
| POST | `/api/ventas` | JWT | ✅ | Crear venta (POS) |
| GET | `/api/ventas/[id]` | JWT | ❌ | Detalle de venta |
| GET | `/api/ventas/daily-stats` | JWT | ❌ | Stats dashboard |
| GET | `/api/ventas/stats?period=` | JWT | ❌ | Stats por período |

### 3.3 Productos

| Método | Ruta | Auth | Validación Zod | Descripción |
|--------|------|------|----------------|-------------|
| GET | `/api/productos` | JWT | ❌ | Listar + buscar + paginar |
| GET | `/api/productos/buscar` | JWT | ❌ | Búsqueda por código/query |
| POST | `/api/productos/create` | JWT | ✅ | Crear producto |
| PUT | `/api/productos/[id]` | JWT | ❌ | Actualizar producto |
| DELETE | `/api/productos/[id]` | JWT | ❌ | Soft delete (activo=false) |
| GET | `/api/productos/top-selling` | JWT | ❌ | Productos más vendidos |

### 3.4 Categorías

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/categorias` | JWT | Listar |
| POST | `/api/categorias` | JWT | Crear |
| GET | `/api/categorias/[id]` | JWT | Una categoría |
| PUT | `/api/categorias/[id]` | JWT | Actualizar |
| DELETE | `/api/categorias/[id]` | JWT | Hard delete |

### 3.5 Administración

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/admin/negocio` | JWT | Obtener configuración |
| PUT | `/api/admin/negocio` | JWT + rol OWNER | Actualizar configuración |
| POST | `/api/upload` | JWT | Subir imagen QR (FormData) |

### 3.6 SRI

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/sri-sync` | JWT | Sincronizar facturas pendientes con SRI |

### 3.7 Mapeo de errores de dominio

```
DomainError.code → HTTP Status:
  STOCK_INSUFICIENTE   → 409 Conflict
  PRODUCTO_NO_ENCONTRADO → 404 Not Found
  VENTA_SIN_LINEAS     → 400 Bad Request
  TRANSICION_INVALIDA  → 422 Unprocessable Entity
  (otros)              → 500 Internal Server Error
```

---

## 4. FRONTEND

### 4.1 Estructura de páginas (App Router)

```
/                    → Landing page (marketing)
/not-found           → 404 personalizada

/(auth)/
  /login             → Inicio de sesión
  /register          → Registro (2 pasos: personal + negocio)

/dashboard/
  /                  → Dashboard (stats, alertas stock, últimas ventas)
  /pos               → Punto de venta (carrito + búsqueda productos)
  /pos/confirmar     → Confirmación de pago (método + cambio + QR)
  /productos         → CRUD productos
  /categorias        → CRUD categorías
  /reportes          → Reportes (filtro fechas, gráficos, tabla)
  /admin/negocio     → Configuración del negocio
```

### 4.2 Layouts

- **Root layout**: Fuentes Google (Inter, Plus Jakarta Sans), ThemeProvider, MotionConfig, AppToaster
- **Auth layout**: Split screen (panel izquierdo marca + panel derecho formulario), theme toggle
- **Dashboard layout**: Header (avatar, menú, logout), BottomNav (6 tabs), AnimatePresence

### 4.3 Estado global (Zustand)

#### auth-store (persistido localStorage)

```
interface AuthState {
  token: string | null
  user: { id, email, nombre, rol, businessId } | null
  isAuthenticated: boolean
  setAuth(data): void
  logout(): void
}
```

#### pos-store (persistido localStorage)

```
interface POSState {
  lineas: LineaCarrito[]       // Items en carrito
  clienteId: string | null     // Cliente opcional
  status: 'IDLE' | 'PROCESSING' | 'SUCCESS' | 'ERROR'
  lastVenta: { id, numeroFactura, total, estadoSri } | null
  error: string | null

  addLinea(producto, cantidad): void
  removeLinea(productoId): void
  updateCantidad(productoId, cantidad): void
  clearSale(): void
  setClienteId(id): void
  procesarVenta(medioPago): Promise<void>
  getTotals(): { subtotal, impuesto, total }
}
```

#### sri-store (en memoria)

```
interface SriState {
  queueStatus: Record<ventaId, Status>
  isOnline: boolean
  setQueueStatus(ventaId, status): void
  setOnline(online): void
  processQueue(): Promise<void>
}
```

Escucha eventos `online`/`offline` del navegador.

### 4.4 Componentes UI

#### Propios del proyecto (apps/web/components/ui/)

23 componentes: avatar, badge, button, calendar, card, chart (recharts), date-range-picker, dialog, dropdown-menu, error-card, input, label, popover, radio-group, scroll-area, select, separator, sheet, skeleton, table, tabs, toggle, toggle-group, tooltip

#### Compartidos (@agilgestion/ui)

5 componentes: StatCard, SaleCard, QuantityStepper, StatusBadge, PaymentMethod

---

## 5. DOMINIO

### 5.1 Entidades con interfaces completas

#### Negocio

```
Negocio {
  id: string
  nombre: string
  ruc: string
  nombreComercial: string | null
  direccion: string | null
  telefono: string | null
  email: string | null
  ambienteSri: AmbienteSri ('PRUEBAS' | 'PRODUCCION')
  certificadoPath: string | null
  certificadoPassword: string | null
  qrCodePath: string | null
  createdAt: Date
}
```

#### Producto

```
Producto {
  id: string
  codigo: string
  nombre: string
  precioUnitario: number
  precioConImpuesto: number
  categoriaId: string | null
  stockActual: number
  stockMinimo: number
  tipoImpuesto: TipoImpuesto ('IVA15' | 'IVA0' | 'ICE')
  activo: boolean
  businessId: string
  createdAt: Date
  updatedAt: Date
}
```

#### Venta

```
Venta {
  id: string
  businessId: string
  numeroFactura: string
  fecha: Date
  clienteId: string | null
  lineas: LineaVenta[]
  subtotal: number
  descuentoTotal: number
  impuestoTotal: number
  total: number
  estadoSri: EstadoSri ('PENDIENTE' | 'RECIBIDO' | 'AUTORIZADO' | 'RECHAZADO')
  claveAcceso: string | null
  xmlAutorizado: string | null
  medioPago: MedioPago
  createdBy: string
  createdAt: Date
  updatedAt: Date
}
```

#### Cliente

```
Cliente {
  id: string
  businessId: string
  tipoIdentificacion: '04' | '05' | '06'
  identificacion: string
  razonSocial: string
  nombreComercial: string | null
  direccion: string | null
  telefono: string | null
  email: string | null
  activo: boolean
  createdAt: Date
}
```

### 5.2 Servicios de dominio

#### TransaccionPOSService

```
procesarVentaRegistrada(
  cliente: any,
  lineasInput: LineaVentaInput[],
  businessId: string,
  userId: string,
  medioPago: MedioPago
): Promise<Venta>
```

Flujo:
1. Valida stock para cada producto
2. Calcula totales por línea (subtotal, IVA, descuento)
3. Calcula totales de la venta
4. Genera número de factura secuencial (`001-001-{N}`)
5. Da de baja stock en DB
6. Crea venta + líneas en DB
7. Registra auditoría

#### CalculoSriService

```
calcularIVA(monto: number, tipoImpuesto: TipoImpuesto): number
  → IVA15 = 15%, IVA0 = 0%, ICE = 10%

calcularPorcentajeImpuesto(tipoImpuesto: TipoImpuesto): number

generarClaveAcceso(
  fecha: Date,
  tipoComprobante: TipoComprobante,
  ruc: string,
  secuencia: string,
  ambiente: AmbienteSri
): string  → 49 dígitos
```

#### SriStateMachine

```
Estados: PENDIENTE → RECIBIDO → AUTORIZADO | RECHAZADO → PENDIENTE

canTransition(estadoActual, trigger): boolean
next(estadoActual, trigger): EstadoSri
transition(estadoActual, trigger): EstadoSri  → lanza TransicionInvalidaError si no válida
getValidTriggers(estadoActual): TriggerSri[]
```

### 5.3 Errores de dominio

```
DomainError(code, message, context?)
  ├── StockInsuficienteError(nombre, stockActual, requerido)
  │     code: 'STOCK_INSUFICIENTE'
  ├── ProductoNoEncontradoError(codigo)
  │     code: 'PRODUCTO_NO_ENCONTRADO'
  ├── VentaSinLineasError()
  │     code: 'VENTA_SIN_LINEAS'
  └── TransicionInvalidaError(estadoActual, trigger)
        code: 'TRANSICION_INVALIDA'
```

### 5.4 Tipos enum

```typescript
type EstadoSri = 'PENDIENTE' | 'RECIBIDO' | 'AUTORIZADO' | 'RECHAZADO'
type MedioPago = 'EFECTIVO' | 'TARJETA_CREDITO' | 'TARJETA_DEBITO' | 'TRANSFERENCIA' | 'CHEQUE'
type TipoImpuesto = 'IVA15' | 'IVA0' | 'ICE'
type RolUsuario = 'OWNER' | 'ADMIN' | 'CAJERO'
type AmbienteSri = 'PRUEBAS' | 'PRODUCCION'
type TipoComprobante = 'FACTURA' | 'NOTA_CREDITO'
```

---

## 6. INFRAESTRUCTURA

### 6.1 Repositorios

| Repositorio | Implementa | Métodos |
|-------------|-----------|---------|
| ProductoRepository | IProductoRepository | findById, findByCodigo, findByBusiness, findAvailable, search, create, update, decrementStock |
| CategoriaRepository | ICategoriaRepository | findById, findByBusiness, create, update, delete |
| ClienteRepository | IClienteRepository | findById, findByIdentificacion, findByBusiness, create |
| VentaRepository | IVentaRepository | create, findById, findByNumeroFactura, findByBusinessAndDateRange, findTodaySales, updateEstadoSri, getNextSecuencial, getTopSelling |
| UsuarioRepository | IUsuarioRepository | findById, findByEmail, create |
| NegocioRepository | INegocioRepository | findById, findByRuc, create, update |
| AuditoriaRepository | IAuditoriaRepository | log, findByEntity |

### 6.2 Pool de conexiones

```typescript
// pool.ts
pool = new Pool({ connectionString: DATABASE_URL, max: 10 })

// index.ts
getPool(): Promise<Pool>           → Singleton perezoso
getDb(pool): DrizzleDB              → Singleton perezoso
initDb(): Promise<void>             → Inicialización (instrumentation.ts)
requireDb(): DrizzleDB              → Síncrono, lanza error si no hay URL
withBusinessContext(pool, businessId, fn)  → Setea app.current_business_id para RLS
```

### 6.3 Autenticación

```
JWTAuthService
  sign(user): string              → Firma JWT (24h, HS256)
  verify(token): Payload | null   → Verifica y decodifica
  extractToken(header): string | null
  verifyFromHeader(header): Payload | null

Password
  hashPassword(password): string  → bcrypt, salt rounds 12
  verifyPassword(password, hash): boolean
```

---

## 7. INTEGRACIÓN SRI (ECUADOR)

### 7.1 Flujo de facturación electrónica

```
1. Venta creada → estado PENDIENTE
2. SriComprobanteService.generarComprobante(venta)
   → FacturaXmlBuilder construye XML con:
     - infoTributaria (ambiente, ruc, claveAcceso, secuencial)
     - infoFactura (fecha, cliente, totales, impuestos)
     - detalles (productos con IVA desglosado)
3. CertificateLoader carga .p12 → extrae certificado + llave privada PEM
4. XML firmado digitalmente
5. Envío vía SOAP a SRI:
   - RecepcionComprobantes → Recibe XML
   - AutorizacionComprobantes → Consulta autorización (polling)
6. Estado actualizado: AUTORIZADO o RECHAZADO
7. En caso de error → sri_queue con reintentos (backoff exponencial)
```

### 7.2 Endpoints SRI

```
PRUEBAS:
  Recepción:   https://celcer.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantes?wsdl
  Autorización: https://celcer.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantes?wsdl

PRODUCCIÓN:
  Recepción:   https://cel.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantes?wsdl
  Autorización: https://cel.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantes?wsdl
```

### 7.3 Cola offline (sri_queue)

- Backoff exponencial: 1s, 2s, 4s, 8s, 16s
- Máximo 5 intentos por comprobante
- Se activa al reconectar (evento `online` del navegador)
- Procesa facturas pendientes de los últimos 30 días

---

## 8. CAPACIDAD Y LÍMITES

### 8.1 Neon (Base de datos)

El connection string actual sugiere plan **Launch (Free)** o **Scale**:

| Recurso | Launch (Free) | Scale (mínimo) |
|---------|---------------|----------------|
| Almacenamiento | 10 GB | 50 GB |
| RAM de cómputo | 0.5 GB (compartido) | 1 GB |
| Horas de cómputo | 100 h/mes (~3.3h/día) | 300 h/mes |
| Conexiones (pooler) | 25 | 50+ |
| vCPU | 0.25 (ramp-up a 1) | 1 |

**Traducción a capacidad del sistema:**

| Métrica | Estimado en Free | Limitante |
|---------|-----------------|-----------|
| Negocios | 1-5 | Cuello de botella: horas de cómputo |
| Productos por negocio | ~100,000 | 10 GB de almacenamiento |
| Clientes por negocio | ~50,000 | |
| Facturas por negocio | ~500,000 (con líneas) | |
| Facturas/día (operación continua) | ~100-200 | Horas de cómputo (3.3h/día en Free) |
| Cajeros simultáneos | 1-5 | Pool de 10 conexiones |

### 8.2 Vercel (Hosting)

El plan depende de la configuración del proyecto en Vercel. No hay `vercel.json` en el repo.

| Recurso | Hobby (Free) | Pro ($20/mes) |
|---------|-------------|---------------|
| Ancho de banda | 100 GB/mes | 1 TB/mes |
| Timeout Serverless Functions | 10s | 60s (900s con Advanced) |
| Memoria Serverless Functions | 512 MB | 1 GB |
| Request rate | ~60 req/min | ~500 req/min |
| Minutos de build | 6,000/mes | 24,000/mes |

### 8.3 Limitaciones conocidas

| Aspecto | Detalle | Recomendación |
|---------|---------|---------------|
| **Horas de cómputo Neon** | En Free, 3.3h/día. Si se usa 10h/día, la BD se pausa | Migrar a Neon Scale ($19/mes, 300h/mes) |
| **Imágenes QR en Vercel** | Se guardan en `public/uploads/` (efímero en serverless) | Migrar a S3 o Cloudinary |
| **Reportes con muchos datos** | Queries de stats agregan sobre todas las ventas | Agregar índices adicionales o pre-agregación |
| **SRI sync batch** | Procesa 30 días de ventas pendientes | Paginación o procesamiento por lotes |
| **Multi-tenancy (RLS)** | `current_setting` funciona bien para cientos de negocios | Para miles, considerar separación de BD |
| **Sin caché** | No hay Redis ni capa de caché | Agregar caché para productos frecuentes |

---

## 9. CONFIGURACIÓN DEL PROYECTO

### 9.1 Variables de entorno

```env
# Base de datos
DATABASE_URL=postgresql://user:pass@host:port/db

# JWT
JWT_SECRET=<clave-secreta>

# SRI (opcional en desarrollo)
SRI_CERT_PATH=./certs/certificado.p12
SRI_CERT_PASSWORD=<contraseña>
```

### 9.2 Scripts disponibles

```bash
pnpm dev          → Inicia servidor de desarrollo (turbo run dev)
pnpm build        → Compila todo (turbo run build)
pnpm test         → Ejecuta tests
pnpm lint         → Linter
pnpm typecheck    → TypeScript type checking
```

### 9.3 Migraciones de base de datos

```bash
# Generar migración desde packages/infrastructure/
cd packages/infrastructure
npx drizzle-kit generate

# Aplicar migración
npx drizzle-kit migrate
```

---

## 10. PRUEBAS

### 10.1 Tests unitarios (Vitest)

- **Ubicación:** `packages/domain/tests/`
- **Framework:** Vitest v4.1
- **Cobertura actual:**
  - Cálculos de IVA (IVA15, IVA0, ICE)
  - Generación de clave de acceso SRI (49 dígitos)
  - Máquina de estados SRI (transiciones válidas e inválidas)

### 10.2 Tests E2E (Playwright)

- **Ubicación:** `tests/e2e/`
- **Framework:** Playwright v1.60
- **Pruebas actuales:**
  - Flujo completo de venta POS (< 5 segundos)
  - Dashboard muestra ventas del día
  - Venta offline se encola y sincroniza al reconectar
- **Configuración:** Desktop Chrome + Mobile Safari, base URL `http://localhost:3000`, 2 reintentos en CI

### 10.3 Ejecución

```bash
# Tests unitarios
cd packages/domain
npx vitest run

# Tests E2E
cd tests
npx playwright test
```

---

## 11. ANIMACIONES

### 11.1 Librería

**Motion** (Framer Motion) v12.38 — variantes compartidas:

| Variante | Efecto |
|----------|--------|
| fadeInUp / fadeInDown / fadeInLeft / fadeInRight | Entrada con opacidad + desplazamiento |
| scaleIn / scaleBounce | Escalado con rebote |
| staggerContainer / staggerItem | Hijos con delay escalonado |
| slideInUp / slideInDown / slideInLeft / slideInRight | Deslizamiento |
| pageTransition | Transición de página (opacidad + escala) |
| successCelebration | Animación de éxito (check + rebote) |
| hoverLift / scaleOnHover / scaleOnTap | Interacciones |

---

## 12. ESTILOS

- **Framework:** Tailwind CSS v4
- **Sistema de temas:** CSS variables HSL (light + dark) vía `next-themes`
- **Utilitario de clases:** `cn()` (clsx + tailwind-merge)
- **Paleta personalizada:** cloud-white, canvas-fog, slate-text, ash-gray, stone-border, platinum-outline, steel-gray, ghost-ink, chartwell-blue, sky-tint, dark-bg, on-dark-text, on-dark-muted
- **Tipografía:** Plus Jakarta Sans (headings), Inter (body)
