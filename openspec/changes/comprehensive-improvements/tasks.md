# Tasks: Comprehensive Improvements

**Status**: tasked
**Created**: 2026-05-14
**Depends on**: spec.md, design.md

---

## Phase 1: Infrastructure (Database + Domain)

- [x] **1.1** Add `qrCodePath: text('qr_code_path')` column to businesses table in `packages/infrastructure/src/db/schema.ts`
- [x] **1.2** Generate Drizzle migration via `drizzle-kit generate`
- [x] **1.3** Add `qrCodePath: string | null` to `Negocio` interface in `packages/domain/src/entities/Negocio.ts`
- [x] **1.4** Add `qrCodePath?: string` to `NegocioInput` interface

## Phase 2: API Endpoints

- [x] **2.1** Create `POST /api/upload` endpoint in `apps/web/app/api/upload/route.ts` with file validation (format, size) and storage to `public/uploads/`
- [x] **2.2** Add `apiUpload()` function to `apps/web/lib/api-client.ts` for FormData requests with auth token
- [x] **2.3** Update `PUT /api/admin/negocio` route to accept and persist `qrCodePath`
- [x] **2.4** Create `lib/error-handler.ts` with `handleApiError()` mapping DomainError codes to HTTP status codes
- [x] **2.5** Update `api/ventas/route.ts` (GET + POST) to use `handleApiError()`

## Phase 3: Error Handling — Frontend

- [x] **3.1** Create global `app/error.tsx` error boundary
- [x] **3.2** Create global `app/not-found.tsx` 404 page
- [x] **3.3** Create `app/(auth)/error.tsx` error boundary for login/register
- [x] **3.4** Create shared `components/ui/error-card.tsx` component
- [x] **3.5** Refactor `dashboard/error.tsx` to use ErrorCard
- [x] **3.6** Refactor `dashboard/reportes/error.tsx` to use ErrorCard
- [x] **3.7** Refactor `dashboard/productos/error.tsx` to use ErrorCard
- [x] **3.8** Refactor `dashboard/pos/error.tsx` to use ErrorCard

## Phase 4: Error Handling — POS Components

- [x] **4.1** Add `toast.error('Error al buscar productos')` in product-search.tsx catch block
- [x] **4.2** Add `toast.error('Error al cargar productos disponibles')` in available-products.tsx initial fetch
- [x] **4.3** Add `toast.error('Error al cargar más productos')` in available-products.tsx loadMore
- [x] **4.4** Add `toast.error('Error al cargar productos populares')` in top-selling.tsx catch block

## Phase 5: Error Handling — Empty Catch Blocks

- [x] **5.1** Fix empty catch in `dashboard/reportes/page.tsx` fetchStats
- [x] **5.2** Fix empty catch in `dashboard/reportes/page.tsx` handleSaleClick
- [x] **5.3** Fix empty catch in `dashboard/page.tsx` fetchProductos
- [x] **5.4** Fix empty catch in `stores/sri-store.ts` processQueue

## Phase 6: POS Payment Improvements

- [x] **6.1** Remove `toast.warning('Verificando disponibilidad de stock...')` from confirmar/page.tsx handleConfirmar
- [x] **6.2** Change `useState<MedioPago>('EFECTIVO')` to `useState<MedioPago | null>(null)`
- [x] **6.3** Update `canConfirm` logic to require explicit payment method selection
- [x] **6.4** Add null guard in `handleConfirmar` for metodoPago
- [x] **6.5** Update logout in `components/layout/header.tsx` to redirect to `/` via `useRouter`

## Phase 7: QR Code — Admin Page

- [x] **7.1** Add `qrCodePath` to NegocioData interface
- [x] **7.2** Add `qrCodePath` to formData state and initial fetch
- [x] **7.3** Implement `handleUploadQR` function with file validation (2MB limit)
- [x] **7.4** Implement `handleRemoveQR` function
- [x] **7.5** Add QR code upload section UI (file input, preview, replace, delete)

## Phase 8: QR Code — POS Display

- [x] **8.1** Import `apiFetch` and add `qrCodePath` state to confirmar/page.tsx
- [x] **8.2** Fetch business data on mount to get `qrCodePath`
- [x] **8.3** Add conditional `AnimatePresence` block for TRANSFERENCIA showing QR image
- [x] **8.4** Show informative message if no QR is configured

## Phase 9: Documentation

- [x] **9.1** Create `docs/TECHNICAL.md` with full system documentation
- [x] **9.2** Create SDD artifacts (proposal, spec, design, tasks, verify, archive)

## Phase 10: Git & Deploy

- [x] **10.1** Stage all changes and create commit
- [x] **10.2** Push to remote repository
