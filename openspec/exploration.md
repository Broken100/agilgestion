# AG-Ágil Gestión — Exploración de Fundación Core

**Fecha**: 2026-05-13
**Estado**: Completado

---

## 1. Sistema de Diseño

### Fuentes
- **`@google/design.md` v0.1.1**: Instalado en workspace raíz. Define el formato canónico para DESIGN.md con YAML frontmatter + markdown prose.
- **`reserva-node/docs/STYLE-GUIDE.md`**: Guía completa con tokens CSS, componentes, patrones establecidos (Stats Block, Feature Card, Pricing Card).

### Formato de Tokens DESIGN.md
```yaml
---
version: alpha
name: AG-Ágil Gestión
colors:
  primary: "#..."
  secondary: "#..."
typography:
  h1:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: 600
    lineHeight: 1.1
spacing:
  base: 16px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 32px
rounded:
  sm: 4px
  md: 8px
  lg: 12px
  full: 9999px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral}"
    rounded: "{rounded.md}"
---
```

### Secciones requeridas DESIGN.md
1. Overview (Brand & Style)
2. Colors
3. Typography
4. Layout & Spacing
5. Elevation & Depth
6. Shapes
7. Components
8. Do's and Don'ts

---

## 2. Arquitectura de Referencia

### ReservaNode (reserva-node)
**Stack**: React + Vite (frontend) / Express + Prisma + PostgreSQL (backend)

**Patrones adoptables**:
- **Multi-tenancy via JWT**: El middleware `auth.ts` extrae `businessId` del token JWT y lo inyecta en `req`. Todas las queries de base de datos filtran por `businessId`.
- **Validación con Zod**: Schemas Zod en cada ruta (`updateSchema`, etc.) para validación de entrada.
- **Estructura backend**: `middleware/`, `routes/`, `lib/prisma.js` — limpio pero monolítico.
- **Estilo visual**: Tokens CSS completos, Inter como font family, sistema de componentes (Button, Input, Card, Badge, etc.).

**Limitaciones**: `strict: false` en tsconfig — AG-Ágil aplicará strict completo.

### MenteEc
**Stack**: React 19 + Vite + Tailwind 4 + Express + MongoDB

**Patrones adoptables**:
- `moduleResolution: "bundler"` — relevante para Next.js
- Tailwind 4 con theme variables
- Skill registry bien estructurado

### Altura Real Estate
**Stack**: Express + TypeScript + controllers/routes/middleware

**Patrones**: Separación controllers/routes estándar. Sin ORM moderno (usa queries directas).

---

## 3. Estado del Workspace

### Directorio del proyecto
- `D:\2026\app\agilgesion` — existe, vacío (sin archivos fuente)
- `.atl/skill-registry.md` — creado durante init
- `openspec/` — creado (config.yaml, specs/, changes/, exploration.md)

### Monorepo
- **No existe `pnpm-workspace.yaml`** — debe crearse
- **No existe `turbo.json`** — debe crearse
- Root solo tiene `package.json` con `@google/design.md` como dependencia

### Tooling disponible
- pnpm 11.1.1
- Node 24.12.0
- npm 11.6.2

---

## 4. Requisitos SRI (Facturación Electrónica Ecuador)

### Lo que sabemos
- **Formato**: XML firmado con XAdES-BES (XML Advanced Electronic Signatures)
- **Flujo de estados**: Pendiente → Recibido → Autorizado / Rechazado
- **Entidad reguladora**: Servicio de Rentas Internas (SRI) de Ecuador
- **Requisitos**: Firma digital con certificado PKCS#12, envío a web services del SRI, recepción de autorización

### Lo que falta investigar
- Endpoints exactos del SRI (ambiente de pruebas vs producción)
- Formato específico del XML para cada tipo de comprobante (factura, nota de crédito, etc.)
- Manejo de claves de acceso (access key de 49 dígitos)
- Timeouts y reintentos en entornos offline

---

## 5. Riesgos y Gaps

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| SRI XML complejo sin referencia de código | Alto | Dedicar agente Compliance específico, dockerizar ambiente de pruebas SRI |
| Drizzle ORM sin referencias en workspace | Medio | Usar documentación oficial, community templates |
| Multi-tenancy en Next.js con RLS | Medio | Implementar a nivel de middleware + row-level security en PostgreSQL |
| Offline-first para POS móvil | Alto | IndexedDB + Service Worker + sincronización diferida |
| Tailwind v4 breaking changes (sin @apply) | Bajo | Usar CSS layers y @utility |

---

## 6. Recomendaciones

1. **Crear DESIGN.md primero** — define los tokens que usarán todos los agentes
2. **Iniciar con Domain Agent** — las entidades de negocio son el contrato entre capas
3. **PostgreSQL con Row-Level Security** — mejor que filtrado por aplicación para multi-tenancy
4. **Estructura monorepo**: `packages/domain`, `packages/infrastructure`, `apps/web`, `packages/shared`
5. **Compliance Agent como paquete separado** — `packages/sri` con lógica de XML + firma
