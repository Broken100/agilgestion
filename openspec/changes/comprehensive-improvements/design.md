# Design: Comprehensive Improvements

**Status**: designed
**Created**: 2026-05-14
**Depends on**: proposal.md

---

## ADR-7: File-Based Image Storage (Local)

**Decision**: Store uploaded QR code images in `public/uploads/` served statically by Next.js.
**Rationale**: Simplest approach with zero external dependencies. Files in `public/` are served at the root URL (`/uploads/qr-{id}.png`). No need for S3 SDK, Cloudinary client, or additional configuration.
**Trade-off**: In Vercel serverless deployments, `public/uploads/` is ephemeral — images are lost on redeploy. Future migration to S3/cloud storage is recommended.

## ADR-8: Separate Upload Endpoint

**Decision**: Create a dedicated `POST /api/upload` endpoint instead of embedding file handling in the negocio PUT endpoint.
**Rationale**: Separation of concerns. The upload endpoint handles multipart/form-data, validates file type and size, saves to disk, and returns a path. The negocio PUT endpoint receives a simple JSON string path. This keeps each endpoint simple and follows the single-responsibility principle.
**Flow**: Admin page → selects file → `apiUpload('/api/upload', formData)` → receives `{ path: '/uploads/qr-{id}.png' }` → sets `formData.qrCodePath = path` → saves via PUT /api/admin/negocio

## ADR-9: ErrorCard as Shared Component

**Decision**: Extract the repeated `AlertCircle + message + retry button` pattern into a reusable `ErrorCard` component in `apps/web/components/ui/error-card.tsx`.
**Rationale**: DRY principle. 6 error pages were using nearly identical JSX. A single component with props (`title`, `message`, `onRetry`, `fullScreen`) reduces duplication and ensures consistent error UI across the application.

## ADR-10: Domain Error to HTTP Mapping Utility

**Decision**: Create `lib/error-handler.ts` with a centralized `handleApiError(error, logPrefix)` function.
**Rationale**: Before this change, all domain errors (StockInsuficienteError, ProductoNoEncontradoError, etc.) were caught and returned as generic HTTP 500. This utility inspects the error's `code` property (from `DomainError`) and maps it to the appropriate HTTP status code (409, 404, 400, 422). This follows the existing `DomainError` pattern and makes the API semantically correct.

## ADR-11: Payment Method Without Default

**Decision**: Change `useState<MedioPago>('EFECTIVO')` to `useState<MedioPago | null>(null)`.
**Rationale**: Forces explicit user selection. Reduces accidental confirmations with wrong payment method. UX is improved by requiring conscious choice.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│  apps/web                                            │
│                                                      │
│  ┌──────────────┐   ┌──────────────┐                 │
│  │ Admin Page    │   │ POS Confirmar│                │
│  │ (negocio/     │   │ (confirmar/  │                │
│  │  page.tsx)    │   │  page.tsx)   │                │
│  └──────┬───────┘   └──────┬───────┘                │
│         │                  │                        │
│  ┌──────▼───────┐   ┌──────▼───────┐                 │
│  │ apiUpload()  │   │ GET /api/    │                │
│  │ POST /api/   │   │ admin/negocio│                │
│  │ upload       │   └──────┬───────┘                │
│  └──────┬───────┘          │                        │
│         │                  │                        │
│  ┌──────▼───────┐   ┌──────▼───────┐                 │
│  │ File System  │   │ NegocioRepo  │                │
│  │ /public/     │   │ .findById()  │                │
│  │ uploads/     │   └──────────────┘                │
│  └──────────────┘                                   │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │ Error Boundaries                             │   │
│  │  app/error.tsx (root)                        │   │
│  │  app/not-found.tsx (404)                     │   │
│  │  app/(auth)/error.tsx (auth)                 │   │
│  │  dashboard/error.tsx → ErrorCard             │   │
│  │  reportes/error.tsx → ErrorCard              │   │
│  │  productos/error.tsx → ErrorCard             │   │
│  │  pos/error.tsx → ErrorCard                   │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │ Error Handler Utility                        │   │
│  │  lib/error-handler.ts                        │   │
│  │  handleApiError(error, prefix)               │   │
│  │    → DomainError.code → HTTP status          │   │
│  │    → Used by: api/ventas/route.ts            │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

## Data Flow: QR Code Upload

```
Admin Page                     API Upload                   File System          DB
    │                             │                             │                 │
    │  1. Select image file       │                             │                 │
    ├────────────────────────────►│                             │                 │
    │                             │  2. Validate format/size    │                 │
    │                             │  3. Save file               │                 │
    │                             ├──────────────────────────►  │                 │
    │                             │  4. Return path             │                 │
    │  5. Receive { path }        │                             │                 │
    │◄────────────────────────────┤                             │                 │
    │                             │                             │                 │
    │  6. PUT /api/admin/negocio  │                             │                 │
    │  { qrCodePath: path }       │                             │                 │
    ├──────────────────────────────────────────────────────────►│                 │
    │                             │                             │  7. UPDATE set  │
    │                             │                             │  qr_code_path   │
    │                             │                             ├────────────────►│
    │                             │                             │                 │
```

## Data Flow: QR Code Display in POS

```
POS Confirmar Page             API                          DB
    │                             │                         │
    │  1. Load page               │                         │
    │  2. GET /api/admin/negocio  │                         │
    ├────────────────────────────►│                         │
    │                             │  3. SELECT qr_code_path │
    │                             ├────────────────────────►│
    │                             │  4. Return { qrCodePath }│
    │  5. Store qrCodePath state  │                         │
    │◄────────────────────────────┤                         │
    │                             │                         │
    │  6. User selects            │                         │
    │     "Transferencia"         │                         │
    │                             │                         │
    │  7. Render <img src={path} />                         │
    │     (if path exists)        │                         │
    │     OR "No configurado"     │                         │
    │                             │                         │
```
