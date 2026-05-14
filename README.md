# AgilGestión — POS Inteligente para Ecuador

Sistema de punto de venta (POS) moderno con facturación electrónica y cumplimiento SRI para negocios ecuatorianos.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 15 (App Router), React 19, Tailwind CSS 4, shadcn/ui |
| Estado | Zustand 5 con persistencia localStorage |
| Backend/API | Next.js API Routes + Server Actions |
| Base de Datos | Neon PostgreSQL via Drizzle ORM |
| Auth | JWT (jose) con RLS por negocio |
| Facturación Electrónica | SRI XML-firmado vía xml-crypto |

## Estructura

```
agilgestion/
├── apps/
│   └── web/             # Next.js app — frontend + API routes
├── packages/
│   ├── domain/          # Entidades e interfaces de repositorio
│   ├── infrastructure/  # DB, auth, repositorios, servicios SRI
│   └── shared/          # Schemas Zod, tipos, utilidades
├── drizzle.config.ts    # Configuración de migraciones DB
└── turbo.json           # Turborepo pipeline
```

## Funcionalidades

- **Punto de Venta** — interfaz táctil con búsqueda, carrito, descuentos, selección de impuestos
- **Catálogo** — gestión de productos, categorías, stock, precios
- **Ventas** — historial completo con líneas de detalle, clientes, métodos de pago
- **Clientes** — registro, historial de compras
- **Categorías** — CRUD completo con filtros
- **Dashboard** — vista de negocio con cards informativos
- **Facturación Electrónica SRI** — generación y firma de XML, envío y recepción de comprobantes
- **Seguridad** — autenticación JWT, RLS por negocio en todas las tablas

## Requisitos

- Node.js 20+
- pnpm 9+
- Base de datos PostgreSQL (Neon recomendado)

## Variables de Entorno

Crear `apps/web/.env`:

```env
DATABASE_URL=postgresql://...
JWT_SECRET=tu-secreto-aqui
SRI_CERT_PATH=./certificates/firma.p12
SRI_CERT_PASSWORD=password-del-certificado
```

## Desarrollo

```bash
pnpm install
pnpm dev              # Inicia apps/web en localhost:3000
pnpm db:push          # Sincroniza esquema DB
pnpm test             # Tests con Vitest
pnpm lint             # ESLint + Next lint
```

## Despliegue

Desplegado en Vercel con:

- Root Directory: `apps/web`
- Build: `next build`
- Migraciones automáticas vía `postinstall` (drizzle-kit push)

Variables de entorno requeridas en Vercel: `DATABASE_URL`, `JWT_SECRET`, `SRI_CERT_PATH`, `SRI_CERT_PASSWORD`.
